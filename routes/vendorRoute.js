const express = require('express');
const Vendor = require('../models/Vendor.js');
const auth = require('../utils/jwtUtils.js');
const RFQs = require('../models/RFQ.js');
const POs = require('../models/POs.js');

const router = express.Router();

router.post('/vendorreg', async (req, res) => {
    const { code, name, email, pic, phone, street, city, state, zip, note } = req.body;

    if (!name || !code) {
        return res.status(400).json({ message: 'Please provide code, name' });
    }

    try {
        const existingUser = await Vendor.findOne({ $or: [{ code }, { name },] });
        if (existingUser) {
            return res.status(400).json({ message: 'Vendor with this name or code already exists' });
        }

        const newUser = new Vendor({ code, name, email, pic, phone, street, city, state, zip, note });
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
    const { code, name, email, pic, phone, street, city, state, zip, note } = req.body;

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

        const oldName = user.name;

        user.name = name || user.name;
        user.code = code || user.code;
        user.email = email || user.email;
        user.pic = pic || user.pic;
        user.phone = phone || user.phone;
        user.street = street || user.street;
        user.city = city || user.city;
        user.state = state || user.state;
        user.zip = zip || user.zip;
        user.note = note || user.note;            

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