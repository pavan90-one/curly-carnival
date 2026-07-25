const express = require('express');
const orderRoutes = require('./routes/order.routes');
const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'order-service' }));
app.use('/orders', orderRoutes);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
