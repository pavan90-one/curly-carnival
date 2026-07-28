const express = require('express');
const { identityMiddleware } = require('../../../shared/middleware/identity.middleware');
const { auditMiddleware } = require('../../../shared/middleware/audit.middleware');
const paymentRoutes = require('./routes/payment.routes');
const app = express(); app.use(express.json());
app.use(identityMiddleware);
app.use(auditMiddleware('payment-service'));
app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'payment-service' }));


app.use('/payments', paymentRoutes);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
