const express = require('express');
const app = express(); app.use(express.json());
const products = [
  { id: 'prd_aurora', name: 'Aurora Headphones', price: 129.99, category: 'Audio', inventory: 18, image: '🎧' },
  { id: 'prd_orbit', name: 'Orbit Smart Lamp', price: 74.5, category: 'Home', inventory: 12, image: '💡' },
  { id: 'prd_slate', name: 'Slate Keyboard', price: 99, category: 'Workspace', inventory: 25, image: '⌨️' },
  { id: 'prd_flux', name: 'Flux Bottle', price: 32, category: 'Lifestyle', inventory: 40, image: '🧴' }
];
app.get('/health', (_q, s) => s.json({ status: 'ok', service: 'product-service' }));
app.get('/products', (q, s) => { const search = (q.query.q || '').toLowerCase(); s.json(search ? products.filter(p => p.name.toLowerCase().includes(search)) : products); });
app.get('/products/:id', (q, s) => { const product = products.find(x => x.id === q.params.id); return product ? s.json(product) : s.status(404).json({ error: 'Product not found' }); });
app.post('/products', (q, s) => { const product = { id: `prd_${Date.now()}`, ...q.body }; products.push(product); s.status(201).json(product); });
app.listen(process.env.PORT || 4002, () => console.log('product-service ready'));
