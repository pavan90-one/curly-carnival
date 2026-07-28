const express = require('express');
const { auditMiddleware } = require('../../../shared/middleware/audit.middleware');
const authRoutes = require('./routes/auth.routes');
const app = express();
app.use(express.json());
app.use(auditMiddleware('auth-service'));
app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.use('/auth', authRoutes);
app.use((err, _req, res, _next) => res.status(500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
