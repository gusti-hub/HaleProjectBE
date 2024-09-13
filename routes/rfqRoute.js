const express = require('express');
const POs = require('../models/POs.js');
const RFQs = require('../models/RFQ.js');
const auth = require('../utils/jwtUtils.js');
const Products = require('../models/Product.js');
const moment = require('moment');

const router = express.Router();

router.post('/add-rfq', async (req, res) => {
    try {
        const { rfqId, projectId, vendor, curr, deadline, products } = req.body;

        if (!projectId || !vendor || !curr || !deadline || !products || !Array.isArray(products)) {
            return res.status(400).json({ message: 'All fields are required and productIds must be an array' });
        }

        const newRFQ = new RFQs({
            rfqId,
            projectId,
            vendor,
            curr,
            deadline,
            products: products
        });

        await newRFQ.save();

        const productIds = products.map(product => product.productId);
        const foundProducts = await Products.find({ _id: { $in: productIds } });

        const today = new Date();

        const updatePromises = foundProducts.map(product => {
            product.rfqNumber = newRFQ.rfqId;
            product.rfqSentDate = today.toISOString().split('T')[0];
            return product.save();
        });

        await Promise.all(updatePromises);

        res.status(201).json({ message: 'RFQ created successfully', rfq: newRFQ });
    } catch (error) {
        console.error('Error creating RFQ:', error);
        res.status(500).json({ message: 'An error occurred while creating the RFQ' });
    }
});

router.get('/rfqDetails/:projectId', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const allRFQs = await RFQs.find({ projectId });
        res.status(200).json({ allRFQs });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/getRFQPdts/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const rfq = await RFQs.findById(id);

        if (!rfq) {
            return res.status(404).json({ message: 'RFQ not found' });
        }

        const productIds = rfq.products.map(product => product.productId);
        const products = await Products.find({ _id: { $in: productIds } });

        res.status(200).json({ products: products, curr: rfq.curr, rfqPdts: rfq.products, rfqId: rfq.rfqId, vendor: rfq.vendor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/updatePdtPrice/:id', async (req, res) => {
    const { id } = req.params;
    const productPrices = req.body;

    try {
        const rfq = await RFQs.findById(id);

        if (!rfq) {
            return res.status(404).json({ message: 'RFQ not found' });
        }

        rfq.products.forEach(product => {
            const updatedProduct = productPrices.find(p => p.productId === product.productId);
            if (updatedProduct) {
                product.price = updatedProduct.price;
            }
        });

        rfq.status = "Received RFQ";

        await rfq.save();

        const today = new Date();

        const productIds = productPrices.map(p => p.productId);
        await Products.updateMany(
            { _id: { $in: productIds } },
            { $set: { rfqReceiveDate: today.toISOString().split('T')[0] } }
        );

        const updatePromises = productPrices.map(async pdt => {
            const product = await Products.findOne({ _id: pdt.productId });
            if (product) {
                product.buyPrice = Number(pdt.price);
                return product.save();
            }
        });

        await Promise.all(updatePromises);

        res.status(200).json({ message: 'Products updated successfully', rfq });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/rfqProducts/:projectId/:rfqId', auth, async (req, res) => {
    const { projectId, rfqId } = req.params;

    try {
        const rfq = await RFQs.findOne({ rfqId: rfqId, projectId: projectId });

        if (!rfq) {
            return res.status(404).json({ message: 'Products or RFQ not found' });
        }
        const productIds = rfq.products.map(product => product.productId);

        const productsDetails = await Products.find({ _id: { $in: productIds } });

        const response = rfq.products.map(product => {
            const productDetail = productsDetails.find(pd => pd._id.toString() === product.productId);
            return {
                ...productDetail._doc,
                qty: product.qty,
                price: product.price,
                curr: rfq.curr
            };
        });

        return res.json({ response: response });
    } catch (error) {
        console.error('Error fetching RFQ or products:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getDwdRFQPdts/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const rfq = await RFQs.findById(id);

        if (!rfq) {
            return res.status(404).json({ message: 'RFQ not found' });
        }

        const productIds = rfq.products.map(product => product.productId);
        const products = await Products.find({ _id: { $in: productIds } });

        const response = rfq.products.map(product => {
            const productDetail = products.find(pd => pd._id.toString() === product.productId);
            return {
                ...productDetail._doc,
                qty: product.qty,
                price: product.price
            };
        });

        const productDetails = response.map(product => ({
            ...product,
            orgRFQId: rfq.rfqId,
            orgDeadline: rfq.deadline,
            orgVendor: rfq.vendor,
            orgCurrUnit: rfq.curr,
            orgPOStatus: rfq.status
        }));

        res.status(200).json(productDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/getApproachingRFQsPOs', async (req, res) => {
    try {
        const today = moment().startOf('day');

        const rfqs = await RFQs.find({ status: { $ne: "Received RFQ" } }, '_id rfqId deadline')
            .sort({ deadline: 1 });

        const approachingRFQs = rfqs
            .filter(rfq => moment(rfq.deadline, 'YYYY-MM-DD').isSameOrAfter(today))
            .map(rfq => {
                const deadline = moment(rfq.deadline, 'YYYY-MM-DD').format('YYYY-MM-DD');
                return {
                    _id: rfq._id,
                    id: rfq.rfqId,
                    type: 'RFQ',
                    date: moment(rfq.deadline, 'YYYY-MM-DD').isSame(today, 'day') ? 'Today' : deadline,
                };
            });


        const pos = await POs.find({ isBackOrder: false, inStatus: "Waiting for arrival" }, '_id poId receive')
            .sort({ receive: 1 });

        const approachingPOs = pos
            .filter(po => moment(po.receive, 'YYYY-MM-DD').isSameOrAfter(today))
            .map(po => {
                const receiveDate = moment(po.receive, 'YYYY-MM-DD').format('YYYY-MM-DD');
                return {
                    _id: po._id,
                    id: po.poId,
                    type: 'PO',
                    date: moment(po.receive, 'YYYY-MM-DD').isSame(today, 'day') ? 'Today' : receiveDate,
                };
            });

        const approachingItems = [...approachingRFQs, ...approachingPOs].sort((a, b) => {
            if (a.date === 'Today') return -1;
            if (b.date === 'Today') return 1;

            return moment(a.date).diff(moment(b.date));
        });

        res.status(200).json(approachingItems);

    } catch (error) {
        console.error('Error fetching approaching data:', error);
        res.status(500).json({ message: 'Server error while loading notifications!' });
    }
});

module.exports = router;