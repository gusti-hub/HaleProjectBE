const express = require('express');
const auth = require('../utils/jwtUtils.js');
const Configuration = require('../models/Configuration.js');

const router = express.Router();

// Client Type
router.get('/configuration/type', auth, async (req, res) => {
    const options = [
        { id: '1', name: 'Unit' },
        { id: '2', name: 'Furnishing' },
        { id: '3', name: 'Room' }
    ];
    res.json(options);
});

// get configuration data
router.get('/configuration', auth, async (req, res) => {
    try {
        const configuration = await Configuration.find();
        res.status(200).json({ configuration });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// get configuration data
router.get('/configuration/:type', auth, async (req, res) => {
    try {
        const { type } = req.params;
        const configuration = await Configuration.find({ type: type}).sort({ name: 1 });
        res.status(200).json({ configuration });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Configuration Add
router.post('/configuration', auth, async (req, res) => {
    const { type, code, name } = req.body;

    if (!type || !code || !name ) {
        return res.status(400).json({ message: 'Please provide type, code and name' });
    }

    try {
        const existingConfiguration = await Configuration.findOne({ $and: [{ type }, { code }, { name }] });
        if (existingConfiguration) {
            return res.status(400).json({ message: 'Configuration with this type, code and name already exists' });
        }
        
        const newConfiguration = new Configuration({ type, code, name });
        await newConfiguration.save();

        res.status(201).json({ message: 'Configuration registered successfully', Configuration: newConfiguration });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Configuration Update
router.put('/configuration/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { type, code, name } = req.body;

    try {
        const config = await Configuration.findById(id);
        if (!config) {
            return res.status(404).json({ message: 'configuration not found' });
        }

        if ((type && type !== config.type) || (code && code !== config.code) || (name && name !== config.name)) {
            const existingConfiguration = await Configuration.findOne({ $and: [{ type }, { code }, { name }] });
            if (existingConfiguration) {
                return res.status(400).json({ message: 'Configuration with this type, code and name already exists' });
            }
        }

        config.type = type || config.type;
        config.code = code || config.code;
        config.name = name || config.name;

        await config.save();

        res.status(200).json({ message: 'Configuration updated successfully', config });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Configuration Delete
router.delete('/configuration/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
        const config = await Configuration.findById(id);
        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        await Configuration.deleteOne({ _id: id });
        res.status(200).json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;