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

router.delete('/deleteSection/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const section = await Sections.findById(id);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        await Sections.deleteOne({ _id: id });

        res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

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

router.post('/newProductItem', async (req, res) => {
    const {
        projectId, type, name, desc, code, unit, len, wid, dia, color, material,
        insert, finish, qty, vendor, budget, buyCost, sellCost
    } = req.body;

    try {
        const newProduct = new Products({
            projectId,
            type,
            title: name,
            desc,
            productDetails: {
                code, unit, len, wid, dia, color, material, insert, finish, qty, vendor,
                budget, buyCost, sellCost
            }
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product registered successfully', product: newProduct });
    } catch (error) {
        res.status(400).json({ message: 'Error registering product', error: error.message });
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

router.put('/newProductItem/:id', async (req, res) => {
    const {
        projectId, type, name, desc, code, unit, len, wid, dia, color, material,
        insert, finish, qty, vendor, budget, buyCost, sellCost
    } = req.body;

    try {
        const existingProduct = await Products.findById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updatedProduct = await Products.findByIdAndUpdate(
            req.params.id,
            {
                projectId: projectId || existingProduct.projectId,
                type: type || existingProduct.type,
                title: name || existingProduct.title,
                desc: desc || existingProduct.desc,
                productDetails: {
                    code: code || existingProduct.productDetails.code,
                    unit: unit || existingProduct.productDetails.unit,
                    len: len !== undefined ? len : existingProduct.productDetails.len,
                    wid: wid !== undefined ? wid : existingProduct.productDetails.wid,
                    dia: dia !== undefined ? dia : existingProduct.productDetails.dia,
                    color: color || existingProduct.productDetails.color,
                    material: material || existingProduct.productDetails.material,
                    insert: insert || existingProduct.productDetails.insert,
                    finish: finish || existingProduct.productDetails.finish,
                    qty: qty !== undefined ? qty : existingProduct.productDetails.qty,
                    vendor: vendor || existingProduct.productDetails.vendor,
                    budget: budget !== undefined ? budget : existingProduct.productDetails.budget,
                    buyCost: buyCost !== undefined ? buyCost : existingProduct.productDetails.buyCost,
                    sellCost: sellCost !== undefined ? sellCost : existingProduct.productDetails.sellCost
                }
            },
            { new: true, runValidators: true } 
        );

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
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