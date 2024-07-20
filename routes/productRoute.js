const express = require('express');
const Products = require('../models/Product.js');
const Sections = require('../models/Section.js');

const router = express.Router();

router.post('/addSection', async (req, res) => {
    try {
        const { projectId, secname } = req.body;

        const newSection = new Sections({
            projectId, secname
        });

        await newSection.save();

        res.status(201).json({ message: "Section is added." });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})

router.get('/getsections/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const sectionData = await Sections.find({ projectId });
        res.status(200).json({ sectionData });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/newProduct', async (req, res) => {
    try {
        const { projectId, type, title, desc } = req.body;

        const newProduct = new Products({
            projectId, type, title, desc
        });

        const product = await newProduct.save();

        res.status(201).json({ message: "Product is added.", product });
    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/allProducts/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;
        const allProducts = await Products.find({ projectId });
        res.status(200).json({ allProducts });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/product/:projectId/:name/newComment/:_id', async (req, res) => {
    const { projectId, name, _id } = req.params;
    const { body } = req.body;

    try {
        const product = await Products.findOne({ _id, projectId });

        if (!product) {
            console.log('Product not found'); // Log if product is not found
            return res.status(404).json({ message: 'Product not found' });
        }

        const newComment = {
            name: name,
            body
        };

        product.comments.push(newComment);

        await product.save();

        res.status(201).json({ message: 'Comment added successfully', product });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/product/:_id', async (req, res) => {
    const { _id } = req.params;
    const { title, desc } = req.body;
    try {
        const pdt = await Products.findById(_id);

        if (!pdt) {
            return res.status(404).json({ message: 'Item not found' });
        }

        pdt.title = title || pdt.title;
        pdt.desc = desc || pdt.desc;

        await pdt.save();

        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.delete('/product/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pdt = await Products.findById(id);
        if (!pdt) {
            return res.status(404).json({ message: 'Item not found' });
        }

        await Products.deleteOne({ _id: id });
        
        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;