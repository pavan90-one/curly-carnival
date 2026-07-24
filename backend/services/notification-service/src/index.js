const express = require('express');
const app = express(); app.use(express.json());
const notifications = [];
app.get('/health', (_q, s) => s.json({ status: 'ok', service: 'notification-service' }));
app.get('/notifications', (_q, s) => s.json(notifications));
app.post('/notifications', (q, s) => { const notification = { id: `ntf_${Date.now()}`, status: 'queued', createdAt: new Date().toISOString(), ...q.body }; notifications.push(notification); s.status(202).json(notification); });
app.listen(process.env.PORT || 4005, () => console.log('notification-service ready'));
