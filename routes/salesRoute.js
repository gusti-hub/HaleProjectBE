const express = require('express');
const Sales = require('../models/Sales.js');
const auth = require('../utils/jwtUtils.js');
const Products = require('../models/Product.js');
const Sections = require('../models/Section.js');

const router = express.Router();

// project creation
router.post('/productreg', async (req, res) => {
    try {
        const { name, code, desc, owner, ownerId, client } = req.body;

        const existingSale = await Sales.findOne({ name });
        if (existingSale) {
            return res.status(400).json({ message: "A project with this name already exists" });
        }

        const newSale = new Sales({
            name, code, desc, owner, ownerId, client
        });

        const savedSale = await newSale.save();

        res.status(201).json({ message: "Project is created", project: savedSale });
    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/sales-name', auth, async (req, res) => {
    try {
        const sales = await Sales.find().select('_id name');
        res.status(200).json(sales);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


//update sales data
router.put('/project/:id', async (req, res) => {
    const { id } = req.params;
    const { name, desc, client, budget, imageUrl } = req.body;

    try {
        const prj = await Sales.findById(id);
        if (!prj) {
            return res.status(404).json({ message: 'Project not found' });
        }

        prj.name = name || prj.name;
        prj.desc = desc || prj.desc;
        prj.client = client || prj.client;
        prj.budget = budget || prj.budget;
        prj.imageUrl = imageUrl || prj.imageUrl;

        await prj.save();

        res.status(200).json({ message: 'Project details updated successfully', prj });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//all sales data
router.get('/sales', auth, async (req, res) => {
    try {
        const salesData = await Sales.find().select('_id name code desc owner ownerId client invitedUsers progress createdAt');
        res.status(200).json({ salesData });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/project/:id', auth, async (req, res) => {
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

//update progress
router.put('/setprogress/:_id', async (req, res) => {
    const { _id } = req.params;
    const { progress } = req.body;

    try {
        const prj = await Sales.findById(_id);

        if (!prj) {
            return res.status(404).json({ message: 'Product not found' });
        }

        prj.progress = progress || prj.progress;

        await prj.save();

        res.status(200).json({ message: 'Status updated successfully', project: prj });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//update invited user
router.put('/addinviteduser/:_id', async (req, res) => {
    const { _id } = req.params;
    const { name } = req.body;

    try {
        const prj = await Sales.findById(_id);
        if (!prj) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!prj.invitedUsers.includes(name)) {
            prj.invitedUsers.push(name);
        }

        await prj.save();

        res.status(200).json({ message: 'Invited user added successfully', prj });
    } catch (error) {
        console.error('Error adding invited user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/removeinviteduser/:_id', async (req, res) => {
    const { _id } = req.params;
    const { name } = req.body;

    try {
        const prj = await Sales.findById(_id);
        if (!prj) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const index = prj.invitedUsers.indexOf(name);
        if (index !== -1) {
            prj.invitedUsers.splice(index, 1);
        } else {
            return res.status(404).json({ message: 'User not found.' });
        }

        await prj.save();

        res.status(200).json({ message: 'Invited user removed successfully', prj });
    } catch (error) {
        console.error('Error removing invited user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.delete('/project/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const prj = await Sales.findById(id);
        if (!prj) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await Sales.deleteOne({ _id: id });

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/project-collab/:id', auth, async (req, res) => {
    try {
        const projectId = req.params.id;

        const sections = await Sections.find({ projectId: projectId });

        const result = [];

        for (const section of sections) {

            const products = await Products.find({ projectId: section._id });

            result.push({
                sectionName: section.secname,
                products: products
            });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});



module.exports = router;