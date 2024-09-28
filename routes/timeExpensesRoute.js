const express = require('express');
const router = express.Router();
const auth = require('../utils/jwtUtils');

const Time = require('../models/Time&Expenses');
const Expenses = require('../models/Expenses.js');
module.exports = router;

// Get user's time data
router.get('/times/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch time data for the user
    const timeData = await Time.findOne({ userid: userId });

    if (!timeData) {
      return res.status(404).json({ message: 'No time data found for this user' });
    }

    res.status(200).json({ timeData });
  } catch (error) {
    console.error('Error fetching time data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update or create user's time data
router.post('/times/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, projects } = req.body;

    // Validate request
    if (!date || !projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).json({ message: 'Date and projects are required' });
    }

    // Find existing time data for the user
    let timeEntry = await Time.findOne({ userid: userId, 'time.date': new Date(date) });

    if (timeEntry) {
      // If the date already exists, update the projects for that date
      timeEntry.time = timeEntry.time.map((entry) => {
        if (entry.date.toISOString() === new Date(date).toISOString()) {
          return { date: new Date(date), projects };
        }
        return entry;
      });
    } else {
      // If no entry for that date, create a new one
      timeEntry = await Time.findOneAndUpdate(
        { userid: userId },
        { $push: { time: { date: new Date(date), projects } } },
        { new: true, upsert: true } // Create new entry if user doesn't have any time data yet
      );
    }

    await timeEntry.save();
    res.status(200).json({ message: 'Time entry updated successfully', timeEntry });
  } catch (error) {
    console.error('Error updating time data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add-expense', async (req, res) => {
    const { prj, frmDate, toDate, type, amount, totalAmount, comment, imageUrl } = req.body;

    if (!prj || !frmDate || !toDate || !type || !amount || !totalAmount) {
        return res.status(400).json({ message: 'Please provide all the mandatory details.' });
    }

    try {
        const newExpense = new Expenses({ prj, frmDate, toDate, type, amount, totalAmount, comment, imageUrl });

        await newExpense.save();

        res.status(201).json({ message: 'Expense added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.get('/expenses', auth, async (req, res) => {
    try {
        const expenses = await Expenses.find();
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
