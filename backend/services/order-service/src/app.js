const express = require('express');
const { identityMiddleware } = require('../../../shared/middleware/identity.middleware');
const { auditMiddleware } = require('../../../shared/middleware/audit.middleware');
const orderRoutes = require('./routes/order.routes');
const app = express();
app.use(express.json());
app.use(identityMiddleware);
app.use(auditMiddleware('order-service'));
app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'order-service' }));


app.use('/orders', orderRoutes);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
