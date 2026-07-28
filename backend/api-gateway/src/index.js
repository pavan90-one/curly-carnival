const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const gatewayAuthMiddleware = require('./middleware/auth.middleware');
const { auditMiddleware } = require('../../shared/middleware/audit.middleware');

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
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(auditMiddleware('api-gateway'));

app.get('/carnival', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Apply gateway authentication middleware
app.use(gatewayAuthMiddleware);


for (const [route, target] of Object.entries(services)) {
  app.use(`/api/${route}`, createProxyMiddleware({
    target: `${target}/${route}`,
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers['x-user-id']) {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
        if (req.headers['x-user-role']) {
          proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
        if (req.headers['x-request-id']) {
          proxyReq.setHeader('x-request-id', req.headers['x-request-id']);
        }
      },
      error: (err, _req, res) => {
        if (!res.headersSent) {
          res.status(503).json({ error: `Service '${route}' is currently unavailable at ${target}. Please ensure the service is running.` });
        }
      }
    }
  }));
}
app.listen(port, () => console.log(`API gateway listening on ${port}`));

