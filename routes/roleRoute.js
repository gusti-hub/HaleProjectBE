const express = require('express');
const Role = require('../models/Role.js');

const router = express.Router();

// Role Route
router.get('/role', async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json({ roles });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Role Registration
router.post('/rolereg', async (req, res) => {
    const { code, name } = req.body;

    if (!name || !code) {
        return res.status(400).json({ message: 'Please provide code, name' });
    }

    try {
        const existingRole = await Role.findOne({ $or: [{ name }, { code }] });
        if (existingRole) {
            return res.status(400).json({ message: 'Role with this name or code already exists' });
        }
        
        const newRole = new User({ code, name, email, password: hashedPassword, title, address });
        await newRole.save();

        res.status(201).json({ message: 'RoleUser registered successfully', role: newRole });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
