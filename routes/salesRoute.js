const express = require('express');
const Sales = require('../models/Sales.js');

const router = express.Router();

// project creation
router.post('/productreg', async (req, res) => {
    try {
        const { name, desc, owner, client } = req.body;

        const newSale = new Sales({
            name, desc, owner, client
        });

        const savedSale = await newSale.save();

        res.status(201).json({ message: "Project is created", project: savedSale });
    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//all sales data
router.get('/sales', async (req, res) => {
    try {
        const salesData = await Sales.find().select('_id name desc owner client progress createdAt');
        res.status(200).json({ salesData });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/project/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Sales.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Data not found!' });
        }
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//update 

router.put('/setprogress/:_id', async (req, res) => {
    const { _id } = req.params;
    const { progress } = req.body;

    try {
        const pdt = await Sales.findById(_id);

        if (!pdt) {
            return res.status(404).json({ message: 'Product not found' });
        }

        pdt.progress = progress || pdt.progress;

        await pdt.save();

        res.status(200).json({ message: 'Status updated successfully', project: pdt });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;