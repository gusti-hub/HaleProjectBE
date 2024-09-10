const express = require('express');
const Vendor = require('../models/Vendor.js');
const auth = require('../utils/jwtUtils.js');
const RFQs = require('../models/RFQ.js');
const POs = require('../models/POs.js');

const router = express.Router();

router.post('/vendorreg', async (req, res) => {
    const { code, name, email, title, address } = req.body;

    if (!name || !email || !code) {
        return res.status(400).json({ message: 'Please provide code, name, email.' });
    }

    try {
        const existingUser = await Vendor.findOne({ $or: [{ email }, { code }, { name }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Vendor with this name or email or code already exists' });
        }

        const newUser = new Vendor({ code, name, email, title, address });
        await newUser.save();

        res.status(201).json({ message: 'Vendor registered successfully', user: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/vendors', auth, async (req, res) => {
    try {
        const users = await Vendor.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

router.put('/vendors/:id', async (req, res) => {
    const { id } = req.params;
    const { code, name, email, title, address } = req.body;

    try {
        const user = await Vendor.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        if (code && code !== user.code) {
            const existingUserWithCode = await Vendor.findOne({ code });
            if (existingUserWithCode) {
                return res.status(400).json({ message: 'Code is already used by another vendor' });
            }
        }

        if (email && email !== user.email) {
            const existingUserWithEmail = await Vendor.findOne({ email });
            if (existingUserWithEmail) {
                return res.status(400).json({ message: 'Email is already used by another vendor' });
            }
        }

        const oldName = user.name;

        user.code = code || user.code;
        user.name = name || user.name;
        user.email = email || user.email;
        user.title = title || user.title;
        user.address = address || user.address;

        await user.save();

        if (name && name !== oldName) {
            await RFQs.updateMany(
                { vendor: oldName },
                { $set: { vendor: name } }
            );

            await POs.updateMany(
                { vendor: oldName },
                { $set: { vendor: name } }
            );
        };

        res.status(200).json({ message: 'Vendor updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.delete('/vendors/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Vendor.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const rfqs = await RFQs.find({ vendor: user.name });
        const pos = await POs.find({ vendor: user.name });

        if (rfqs.length > 0 || pos.length > 0) {
            return res.status(404).json({ message: "Can't delete! Vendor has active RFQ(s) or PO(s)." });
        } else {
            await Vendor.deleteOne({ _id: id });
            res.status(200).json({ message: 'Vendor deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/getvendornames', auth, async (req, res) => {
    try {
        const vendors = await Vendor.find({}, 'name');
        res.status(200).json(vendors);
    } catch (error) {
        console.error('Error fetching vendors:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;