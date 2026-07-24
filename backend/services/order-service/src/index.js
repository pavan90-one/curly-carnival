const express = require('express');
const app = express(); app.use(express.json());
const orders = [];
app.get('/health', (_q, s) => s.json({ status: 'ok', service: 'order-service' }));
app.get('/orders', (q, s) => s.json(q.query.userId ? orders.filter(o => o.userId === q.query.userId) : orders));
app.post('/orders', (q, s) => {
  const { userId, items = [] } = q.body;
  if (!userId || !items.length) return s.status(400).json({ error: 'userId and at least one item are required' });
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = { id: `ord_${Date.now()}`, userId, items, total: Number(total.toFixed(2)), status: 'pending', createdAt: new Date().toISOString() };
  orders.push(order); s.status(201).json(order);
});
app.listen(process.env.PORT || 4003, () => console.log('order-service ready'));
