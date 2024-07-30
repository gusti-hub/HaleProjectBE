const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee.js');
const auth = require('../utils/jwtUtils.js');

const router = express.Router();

// Employee Registration
router.post('/empreg', async (req, res) => {
    const { name, email, password, title, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Please provide name, email, password and role.' });
    }

    try {
        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new Employee({ name, email, password: hashedPassword, title, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
        console.log(error);
    }
});

//Employee data
router.get('/employees', auth, async (req, res) => {
    try {
        const users = await Employee.find().select('name email title role');
        res.status(200).json({ users });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

//update employee
router.put('/employee/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password, title, role } = req.body;

    try {
        const user = await Employee.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email && email !== user.email) {
            const existingUserWithEmail = await Employee.findOne({ email });
            if (existingUserWithEmail) {
                return res.status(400).json({ message: 'Email is already used by another user' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.title = title || user.title;
        user.role = role || user.role;

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

// delete employee
router.delete('/employee/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await Employee.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Employee.deleteOne({ _id: id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

//get employee_names
router.get('/getemployeenames', auth, async (req, res) => {
    try {
        const employees = await Employee.find({}, 'name');
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;