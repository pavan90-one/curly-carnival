const express = require('express');
const authRoutes = require('./routes/auth.routes');
const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));
app.use('/auth', authRoutes);
app.use((err, _req, res, _next) => res.status(500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
