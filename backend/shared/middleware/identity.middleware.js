/**
 * Express middleware for downstream microservices to read user identity & request ID
 * forwarded by the API Gateway via HTTP headers: x-user-id, x-user-role, x-request-id
 */
function identityMiddleware(req, res, next) {
    const userId = req.headers['x-user-id'] || null;
    const userRole = req.headers['x-user-role'] || 'user';
    const requestId = req.headers['x-request-id'] || null;

    req.user = userId ? { id: userId, role: userRole } : null;
    req.requestId = requestId;

    next();
}

/**
 * Optional middleware to require authenticated user identity on protected downstream endpoints
 */
function requireAuth(req, res, next) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized. Missing authenticated user identity headers.'
        });
    }
    next();
}

module.exports = {
    identityMiddleware,
    requireAuth
};
