const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const clientRoutes = require('./routes/clientRoute');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api', clientRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
