const RequestLog = require('../models/requestLog.model');

const REDACTED_KEYS = new Set([
    'password', 'pass', 'userpass', 'newpassword', 'currentpassword',
    'token', 'accesstoken', 'refreshtoken', 'authorization', 'cookie',
    'creditcard', 'cvv', 'cardnumber'
]);

function sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
        if (REDACTED_KEYS.has(key.toLowerCase())) {
            cleaned[key] = '[REDACTED]';
        } else if (value && typeof value === 'object') {
            cleaned[key] = sanitizeData(value);
        } else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}

function deriveActionName(method, urlPath) {
    const cleanPath = (urlPath || '').split('?')[0].toLowerCase();
    
    if (cleanPath.includes('/auth/register')) return 'REGISTER';
    if (cleanPath.includes('/auth/login')) return 'LOGIN';
    if (cleanPath.includes('/auth/logout')) return 'LOGOUT';
    if (cleanPath.includes('/orders') && method === 'POST') return 'CREATE_ORDER';
    if (cleanPath.includes('/products') && method === 'POST') return 'CREATE_PRODUCT';
    if (cleanPath.includes('/payments') && method === 'POST') return 'PROCESS_PAYMENT';
    if (cleanPath.includes('/users') && method === 'POST') return 'CREATE_USER';

    const segment = cleanPath.replace(/^\/(api\/)?/, '').replace(/\/+/g, '_').toUpperCase();
    return `${method}_${segment || 'ROOT'}`;
}

function auditMiddleware(serviceName = 'service') {
    return function (req, res, next) {
        const startTime = process.hrtime();

        let responseBody = null;
        const originalJson = res.json;
        const originalSend = res.send;

        res.json = function (body) {
            responseBody = body;
            return originalJson.apply(this, arguments);
        };

        res.send = function (body) {
            if (!responseBody && typeof body === 'string') {
                try {
                    responseBody = JSON.parse(body);
                } catch (_) {
                    responseBody = { body };
                }
            }
            return originalSend.apply(this, arguments);
        };

        res.on('finish', async () => {
            try {
                const diff = process.hrtime(startTime);
                const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);

                const requestId = req.headers['x-request-id'] || req.requestId || `req-${Date.now()}`;
                const userId = (req.user && req.user.id) || req.headers['x-user-id'] || null;

                const action = deriveActionName(req.method, req.path || req.originalUrl);
                const result = res.statusCode < 400 ? 'SUCCESS' : 'FAILED';

                const logDoc = {
                    requestId,
                    userId,
                    service: serviceName,
                    action,
                    request: sanitizeData({
                        ...(req.query && Object.keys(req.query).length ? { query: req.query } : {}),
                        ...(req.params && Object.keys(req.params).length ? { params: req.params } : {}),
                        ...(req.body && Object.keys(req.body).length ? { body: req.body } : {})
                    }),
                    response: sanitizeData({
                        status: res.statusCode,
                        ...(responseBody ? { data: responseBody } : {})
                    }),
                    result,
                    durationMs,
                    createdAt: new Date()
                };

                // Store in memory during tests
                if (!global.__TEST_AUDIT_LOGS__) global.__TEST_AUDIT_LOGS__ = [];
                global.__TEST_AUDIT_LOGS__.push(logDoc);

                // Save to MongoDB if connection is active
                if (RequestLog && RequestLog.db && RequestLog.db.readyState === 1) {
                    await RequestLog.create(logDoc).catch(err => console.error(`[Audit] Error saving log: ${err.message}`));
                }
            } catch (err) {
                console.error(`[Audit] Error generating audit log: ${err.message}`);
            }
        });

        next();
    };
}

module.exports = {
    auditMiddleware,
    sanitizeData,
    deriveActionName
};
