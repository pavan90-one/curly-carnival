const jwtUtil = require('../../../shared/utils/jwt.util');

const PUBLIC_ROUTES = [
  { method: 'GET', path: '/carnival' },
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/refresh' },
  { method: 'POST', path: '/api/auth/forgot-password' },
  { method: 'POST', path: '/api/auth/reset-password' },
  { method: 'GET', path: '/api/products' }
];

function isPublicRoute(req) {
  const reqPath = req.path || req.originalUrl;
  return PUBLIC_ROUTES.some(route => {
    const methodMatch = route.method === '*' || route.method === req.method;
    const pathMatch = reqPath === route.path || reqPath.startsWith(route.path + '/');
    return methodMatch && pathMatch;
  });
}

function gatewayAuthMiddleware(req, res, next) {
  // Ensure x-request-id is set
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  req.headers['x-request-id'] = requestId;
  req.requestId = requestId;

  if (isPublicRoute(req)) {
    return next();
  }

  // Extract access token from Authorization header or cookie
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && (req.cookies.token || req.cookies.accessToken)) {
    token = req.cookies.token || req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Access token required. Please log in.',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    const decoded = jwtUtil.verifyToken(token);
    const userId = decoded.id || decoded._id;
    const userRole = decoded.role || 'user';

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload: missing user ID' });
    }

    // Set identity headers to forward to downstream services
    req.headers['x-user-id'] = userId.toString();
    req.headers['x-user-role'] = userRole;
    req.user = { id: userId.toString(), role: userRole };

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired access token',
      details: err.message
    });
  }
}

module.exports = gatewayAuthMiddleware;
