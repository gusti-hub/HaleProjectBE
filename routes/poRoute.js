const express = require('express');
const auth = require('../utils/jwtUtils.js');
const Products = require('../models/Product.js');
const POs = require('../models/POs.js');
const RFQs = require('../models/RFQ.js');
const DOCs = require('../models/DOCs.js');
const InPdts = require('../models/InPdts.js');

const router = express.Router();

router.post('/add-po', async (req, res) => {
    try {
        const { poId, projectId, vendor, rfq, delivery, receive, totalPrice, products } = req.body;

        if (!poId || !projectId || !vendor || !rfq || !delivery || !receive || !totalPrice || !products || !Array.isArray(products)) {
            return res.status(400).json({ message: 'All fields are required and productIds must be an array' });
        }

        const newPO = new POs({
            poId, projectId, vendor, rfq, delivery, receive, totalPrice, products: products, status: 'Waiting for approval'
        });

        await newPO.save();

        const productIds = products.map(product => product.productId);
        const foundProducts = await Products.find({ _id: { $in: productIds } });

        const today = new Date();

        const updatePromises = foundProducts.map(product => {
            product.poNumber = newPO.poId;
            product.poSentDate = today.toISOString().split('T')[0];
            return product.save();
        });

        await Promise.all(updatePromises);

        res.status(201).json({ message: 'PO created successfully' });
    } catch (error) {
        console.error('Error creating RFQ:', error);
        res.status(500).json({ message: 'An error occurred while creating the PO!' });
    }
});

router.get('/poDetails/:projectId', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const allPOs = await POs.find({ projectId });
        res.status(200).json({ allPOs });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/updatePOStatus/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const po = await POs.findById(id);

        if (!po) {
            return res.status(404).json({ message: 'PO not found' });
        }

        po.status = "Approved";

        po.save();

        res.status(200).json({ message: 'Products updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/getPOPdts/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const po = await POs.findById(id);

        if (!po) {
            return res.status(404).json({ message: 'PO not found' });
        }

        const rfq = await RFQs.findOne({rfqId: po.rfq});

        const productIds = rfq.products.map(product => product.productId);

        const products = await Products.find({ _id: { $in: productIds } });

        // const productDetails = products.map(product => ({
        //     ...product.toObject(),
        //     orgPOId: po.poId,
        //     orgPODate: po.createdAt,
        //     orgRFQ: po.rfq,
        //     orgVendor: po.vendor,
        //     orgTP: po.totalPrice,
        //     orgEstDel: po.delivery,
        //     orgEstRec: po.receive,
        //     orgPOStatus: po.status
        // }));

        const response = rfq.products.map(product => {
            const productDetail = products.find(pd => pd._id.toString() === product.productId);
            return {
                ...productDetail._doc,
                qty: product.qty,
                price: product.price
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving products' });
    }
});

router.get('/getAllPOs', auth, async (req, res) => {
    try {
        const pos = await POs.find();
        res.status(200).json(pos);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/invPO/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const po = await POs.findById(id);

        if (!po) {
            return res.status(404).json({ message: 'PO not found' });
        }

        const rfq = await RFQs.findOne({ rfqId: po.rfq, projectId: po.projectId });

        if (!rfq) {
            return res.status(404).json({ message: 'RFQ not found' });
        }

        const productIds = rfq.products.map(product => product.productId);

        const productsDetails = await Products.find({ _id: { $in: productIds } });

        const response = rfq.products.map(product => {
            const productDetail = productsDetails.find(pd => pd._id.toString() === product.productId);
            return {
                ...productDetail._doc,
                qty: product.qty,
                price: product.price,
                curr: rfq.curr,
            };
        });

        const poDetails = {
            _id: po._id,
            vendor: po.vendor,
            currPO: po.poId,
            currPdts: po.products
        };

        res.status(200).json({ response: response, poDetails: poDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving products' });
    }
});

router.get('/invBackOrderPO/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const po = await POs.findById(id);

        if (!po) {
            return res.status(404).json({ message: 'PO not found' });
        }

        const products = po.products.filter(pdt => pdt.demQty != 0);

        const productIds = products.map(product => product.productId);

        const productsDetails = await Products.find({ _id: { $in: productIds } });

        const response = products.map(product => {
            const productDetail = productsDetails.find(pd => pd._id.toString() === product.productId);
            return {
                ...productDetail._doc,
                qty: product.demQty
            };
        });

        const pdtIdArray = products.map(product => ({ productId: product.productId }));

        const poDetails = {
            _id: po._id,
            vendor: po.vendor,
            currPO: po.poId,
            currPdts: pdtIdArray
        };

        res.status(200).json({ response: response, poDetails: poDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving products' });
    }
});

router.put('/update-rec-qty/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { docNumber, products, status } = req.body;

        const po = await POs.findById(id);

        if (!po) {
            return res.status(404).json({ message: "PO not found" });
        }

        const today = new Date();

        po.docNumber = docNumber || po.docNumber;
        po.inStatus = status || po.inStatus;
        po.recDate = today.toISOString().split('T')[0];

        await po.save();

        const newDoc = new DOCs({
            docNumber: docNumber,
            poId: po._id,
            products: products,
            inStatus: status
        });

        await newDoc.save();

        await Promise.all(products.map(async (product) => {
            const inPdt = await InPdts.findOne({ productID: product.productId });

            if (inPdt) {
                inPdt.totQty = Number(inPdt.totQty) + Number(product.recQty);
                await inPdt.save();
            } else {
                await InPdts.create({
                    productID: product.productId,
                    totQty: Number(product.recQty)
                });
            }
        }));


        const updatedPO = await POs.findOneAndUpdate(
            { _id: id },
            { $set: { products: products } },
            { new: true }
        );

        if (!updatedPO) {
            return res.status(404).json({ message: "Product not found" });
        }

        const docDetails = {
            docNum: newDoc.docNumber,
            poId: newDoc.poId,
            pdts: newDoc.products
        }

        res.status(200).json({ message: "Received Quantity updated", docDetails: docDetails });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ message: "Server Error", error });
    }
});


router.put('/update-recBackOrder-qty/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { products, status } = req.body;

        const po = await POs.findById(id);

        if (!po) {
            return res.status(404).json({ message: "PO not found" });
        }

        const today = new Date();

        po.products = products || po.products;
        po.inStatus = status || po.inStatus;
        po.recDate = today.toISOString().split('T')[0];

        await po.save();

        const doc = await DOCs.findOne({ docNumber: po.docNumber });

        doc.products = products || doc.products;
        doc.inStatus = status || doc.inStatus;

        await doc.save();

        await Promise.all(products.map(async (product) => {
            const inPdt = await InPdts.findOne({ productID: product.productId });

            if (inPdt) {
                inPdt.totQty = Number(inPdt.totQty) + Number(product.recQty);
                await inPdt.save();
            } else {
                await InPdts.create({
                    productID: product.productId,
                    totQty: Number(product.recQty)
                });
            }
        }));

        const docDetails = {
            docNum: doc.docNumber,
            poId: doc.poId,
            pdts: doc.products
        }

        res.status(200).json({ message: "Received Quantity updated", docDetails: docDetails });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
        console.log(error);
    }
});





//For DOCs collection
router.get('/getAllDocs', auth, async (req, res) => {
    try {
        const docs = await DOCs.find();
        res.status(200).json(docs);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/viewDoc/:id/:docNum', auth, async (req, res) => {
    try {
        const { id, docNum } = req.params;

        const doc = await DOCs.findOne({
            docNumber: docNum,
            poId: id
        });

        const po = await POs.findById(id);

        const currPO = {
            poNum: po.poId,
            vendor: po.vendor
        }

        const productIds = doc.products.map(product => product.productId);

        const productsDetails = await Products.find({ _id: { $in: productIds } });

        const response = doc.products.map(product => {
            const productDetail = productsDetails.find(pd => pd._id.toString() === product.productId);
            return {
                ...productDetail._doc,
                recQty: product.recQty,
                demQty: product.demQty
            };
        });

        res.status(200).json({ doc: response, currPO: currPO });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/createBackOrder/:poId', async (req, res) => {

    try {
        const { poId } = req.params;

        const { backOrderProducts, docNum } = req.body;

        const po = await POs.findById(poId);

        if (!po) {
            return res.status(404).json({ message: "PO not found" });
        }

        const clonedPO = po.toObject();

        delete clonedPO._id;

        clonedPO.docNumber = docNum;
        clonedPO.products = backOrderProducts || clonedPO.products;
        clonedPO.isBackOrder = true || false;
        clonedPO.inStatus = "Back Order";
        clonedPO.recDate = "";

        const newPO = new POs(clonedPO);

        await newPO.save();

        const newDoc = new DOCs({
            docNumber: docNum,
            poId: newPO._id,
            products: backOrderProducts,
            inStatus: "Back Order"
        });

        await newDoc.save();

        res.status(200).json({ message: "Back Order is created successfully." });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;