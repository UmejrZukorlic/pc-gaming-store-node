const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'PC Gaming Store API' }));
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
