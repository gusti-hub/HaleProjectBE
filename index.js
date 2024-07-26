const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const clientRoutes = require('./routes/clientRoute');
const employeeRoutes = require('./routes/employeeRoute');
const salesRoutes = require('./routes/salesRoute');
const commentsRoutes = require('./routes/commentsRoute');
const productsRoutes = require('./routes/productRoute');
const vendorRoutes = require('./routes/vendorRoute');

const uploadRoutes = require('./routes/uploadRoute');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api', clientRoutes);
app.use('/api', employeeRoutes);
app.use('/api', salesRoutes);
app.use('/api', commentsRoutes);
app.use('/api', productsRoutes);
app.use('/api', vendorRoutes);

app.use('/api', uploadRoutes);

app.get('/api/roleOptions', (req, res) => {
    const options = [
        { id: '1', name: 'Administrator' },
        { id: '2', name: 'Director' },
        { id: '3', name: 'Project Manager' },
        { id: '4', name: 'Designer'}
    ];
    res.json(options);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
