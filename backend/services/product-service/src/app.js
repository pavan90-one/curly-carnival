const express = require('express');
const productRoutes = require('./routes/product.routes');

const app = express();
app.use(express.json());
app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'product-service' }));
app.use('/products', productRoutes);
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }));

module.exports = app;
