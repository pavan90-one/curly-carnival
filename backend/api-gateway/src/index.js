const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 8080;
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4006',
  users: process.env.USER_SERVICE_URL || 'http://localhost:4001',
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:4002',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:4003',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:4004',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4005'
};

app.use(cors());
app.use(morgan('tiny'));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));
for (const [route, target] of Object.entries(services)) {
  // Express removes the mounted `/api/<route>` prefix before proxying, so add it back for each service.
  app.use(`/api/${route}`, createProxyMiddleware({ target, changeOrigin: true, pathRewrite: path => `/${route}${path}` }));
}
app.listen(port, () => console.log(`API gateway listening on ${port}`));
