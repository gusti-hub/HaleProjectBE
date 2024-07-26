const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const Employee = require('../models/Employee.js');

const router = express.Router();

// Client Registration
router.post('/clientreg', async (req, res) => {
    const { code, name, email, password, title, address } = req.body;

    if (!name || !email || !password || !code) {
        return res.status(400).json({ message: 'Please provide code, name, email, and password' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { code }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or code already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ code, name, email, password: hashedPassword, title, address });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Sign In
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        let user = await User.findOne({ email });
        let userType = 'Client';

        if (!user) {
            user = await Employee.findOne({ email });
            userType = user ? 'Employee' : null;
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id, type: userType }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ 
            message: 'User signed in successfully', 
            token, 
            _id: user._id,
            name: user.name, 
            type: userType 
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


// Client data
router.get('/clients', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//Update client
router.put('/clients/:id', async (req, res) => {
    const { id } = req.params;
    const { code, name, email, password, title, address } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (code && code !== user.code) {
            const existingUserWithCode = await User.findOne({ code });
            if (existingUserWithCode) {
                return res.status(400).json({ message: 'Code is already used by another user' });
            }
        }

        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail) {
                return res.status(400).json({ message: 'Email is already used by another user' });
            }
        }

        user.code = code || user.code;
        user.name = name || user.name;
        user.email = email || user.email;
        user.title = title || user.title;
        user.address = address || user.address;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// delete client
router.delete('/clients/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.deleteOne({ _id: id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//get client_names
router.get('/getclientnames', async (req, res) => {
    try {
        const clients = await User.find({}, 'name');
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
