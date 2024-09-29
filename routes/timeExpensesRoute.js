const express = require('express');
const router = express.Router();
const auth = require('../utils/jwtUtils');

const Time = require('../models/Time&Expenses');
const Expenses = require('../models/Expenses.js');
module.exports = router;


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
