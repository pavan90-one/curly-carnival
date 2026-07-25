const express = require('express'); const notificationRoutes = require('./routes/notification.routes');
const app = express(); app.use(express.json());
app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));
app.use('/notifications', notificationRoutes);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }));
module.exports = app;
