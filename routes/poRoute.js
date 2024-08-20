const express = require('express');
const auth = require('../utils/jwtUtils.js');
const Products = require('../models/Product.js');
const POs = require('../models/POs.js');

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

        const productIds = po.products.map(product => product.productId);

        const products = await Products.find({ _id: { $in: productIds } });

        const productDetails = products.map(product => ({
            ...product.toObject(),
            orgPOId: po.poId,
            orgPODate: po.createdAt,
            orgRFQ: po.rfq,
            orgVendor: po.vendor,
            orgTP: po.totalPrice,
            orgEstDel: po.delivery,
            orgEstRec: po.receive,
            orgPOStatus: po.status
        }));

        res.status(200).json(productDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving products' });
    }
});


module.exports = router;