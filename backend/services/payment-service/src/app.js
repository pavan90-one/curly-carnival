const express = require('express');
const paymentRoutes = require('./routes/payment.routes');
const app = express(); app.use(express.json());
app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'payment-service' }));
app.use('/payments', paymentRoutes);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
