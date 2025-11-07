require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import whitelist middleware
const whitelist = require('./middleware/whitelist');

const app = express();

// ======= Middleware =======
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));

// Input validation (Whitelist)
app.use(whitelist.globalWhitelist);

// Rate limiter
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// ======= Test route =======
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

// ======= Mount routes =======
const employeeRoutes = require('./controllers/employee'); // Employee routes
app.use('/api/employee', employeeRoutes);

// Uncomment and use when customer controller is ready
// const customerRoutes = require('./controllers/customer');
// app.use('/api/customer', customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

