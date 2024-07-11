const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const clientRoutes = require('./routes/clientRoute');

const employeeRoute = require('./routes/employeeRoute');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api', clientRoutes);

app.use('/api', employeeRoute);

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
