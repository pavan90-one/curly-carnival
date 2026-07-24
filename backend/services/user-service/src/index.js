const express = require('express');
const app = express(); app.use(express.json());
const users = [{ id: 'usr_demo', name: 'Avery Patel', email: 'avery@example.com', tier: 'Gold' }];
app.get('/health', (_q, s) => s.json({ status: 'ok', service: 'user-service' }));
app.get('/users', (_q, s) => s.json(users));
app.get('/users/:id', (q, s) => { const user = users.find(x => x.id === q.params.id); return user ? s.json(user) : s.status(404).json({ error: 'User not found' }); });
app.post('/users', (q, s) => { const user = { id: `usr_${Date.now()}`, ...q.body }; users.push(user); s.status(201).json(user); });
app.listen(process.env.PORT || 4001, () => console.log('user-service ready'));
