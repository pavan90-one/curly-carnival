const express = require('express');
const app = express(); app.use(express.json());
const payments = [];
app.get('/health', (_q, s) => s.json({ status: 'ok', service: 'payment-service' }));
app.get('/payments', (_q, s) => s.json(payments));
app.post('/payments', (q, s) => { const { orderId, amount } = q.body; if (!orderId || !amount) return s.status(400).json({ error: 'orderId and amount are required' }); const payment = { id: `pay_${Date.now()}`, orderId, amount, currency: 'USD', status: 'succeeded', createdAt: new Date().toISOString() }; payments.push(payment); s.status(201).json(payment); });
app.listen(process.env.PORT || 4004, () => console.log('payment-service ready'));
