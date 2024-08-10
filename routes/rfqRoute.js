const express = require('express');
const RFQs = require('../models/RFQ.js');
const auth = require('../utils/jwtUtils.js');
const Products = require('../models/Product.js');

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
        const {id} = req.params;

        const rfq = await RFQs.findById(id);

        if (!rfq) {
            return res.status(404).json({ message: 'RFQ not found' });
        }

        const productIds = rfq.products.map(product => product.productId);
        const products = await Products.find({ _id: { $in: productIds } });

        res.status(200).json({products: products, curr: rfq.curr, rfqPdts: rfq.products});
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

        res.status(200).json({ message: 'Products updated successfully', rfq });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;