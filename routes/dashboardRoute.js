const express = require('express');
const Sales = require('../models/Sales.js');
const auth = require('../utils/jwtUtils.js');
const Products = require('../models/Product.js');
const Sections = require('../models/Section.js');
const POs = require('../models/POs.js');
const RFQs = require('../models/RFQ.js');
const Employees = require('../models/Employee.js');

const router = express.Router();

router.get('/dashboard/financetab', auth, async (req, res) => {
    try {
        const pdts = await Products.find();

        const enrichedPdts = await Promise.all(pdts.map(async product => {
            return {
                ...product._doc,
                profitByItem: 0,
                profitFees: 0,
                costAgainstJob: 0,
                JobProfit: 0,
            };
        }));

        res.status(200).json(enrichedPdts);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


module.exports = router;