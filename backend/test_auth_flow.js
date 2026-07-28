const path = require('path');
const assert = require('assert');
const Module = require('module');

// Patch Module._resolveFilename to resolve dependencies from microservices node_modules
const extraPaths = [
    path.join(__dirname, 'services', 'auth-service', 'node_modules'),
    path.join(__dirname, 'api-gateway', 'node_modules'),
    path.join(__dirname, 'shared', 'messaging', 'node_modules')
];

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
    try {
        return originalResolve.call(this, request, parent, isMain, options);
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            for (const searchPath of extraPaths) {
                try {
                    return originalResolve.call(this, request, { ...parent, paths: [searchPath, ...(parent.paths || [])] }, isMain, options);
                } catch (_) {}
            }
        }
        throw err;
    }
};

// Import refactored modules
const jwtUtil = require('./shared/utils/jwt.util');
const passwordUtil = require('./shared/utils/password.util');
const { identityMiddleware, requireAuth } = require('./shared/middleware/identity.middleware');
const gatewayAuthMiddleware = require('./api-gateway/src/middleware/auth.middleware');
const authService = require('./services/auth-service/src/services/auth.service');
const authController = require('./services/auth-service/src/controllers/auth.controller');
const authRepo = require('./services/auth-service/src/repositories/auth.repository');

async function runTests() {
    console.log('====================================================');
    console.log('   AUTHENTICATION FLOW REFACTORING TEST SUITE       ');
    console.log('====================================================\n');

    let passedCount = 0;
    let failedCount = 0;

    function test(description, fn) {
        try {
            fn();
            console.log(`  ✓ PASSED: ${description}`);
            passedCount++;
        } catch (err) {
            console.error(`  ❌ FAILED: ${description}`);
            console.error(`     Error: ${err.message}\n`);
            failedCount++;
        }
    }

    async function testAsync(description, fn) {
        try {
            await fn();
            console.log(`  ✓ PASSED: ${description}`);
            passedCount++;
        } catch (err) {
            console.error(`  ❌ FAILED: ${description}`);
            console.error(`     Error: ${err.message}\n`);
            failedCount++;
        }
    }

    console.log('--- [SECTION 1: Shared Utils (JWT & Password)] ---');

    await testAsync('Password hashing & verification', async () => {
        const plainPassword = 'SecretPassword123!';
        const hash = await passwordUtil.hashPassword(plainPassword);
        assert.ok(hash.includes(':'), 'Hash should contain salt-hash separator');
        
        const isValid = await passwordUtil.comparePassword(plainPassword, hash);
        assert.strictEqual(isValid, true, 'Valid password should verify successfully');

        const isInvalid = await passwordUtil.comparePassword('WrongPassword!', hash);
        assert.strictEqual(isInvalid, false, 'Wrong password should fail verification');
    });

    await testAsync('JWT token generation and verification', async () => {
        const dummyUser = { _id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'admin' };
        
        const accessToken = await jwtUtil.generateAccessToken(dummyUser);
        assert.ok(typeof accessToken === 'string' && accessToken.length > 20, 'Access token generated');

        const decodedAccess = await jwtUtil.verifyToken(accessToken);
        assert.strictEqual(decodedAccess.id, dummyUser._id);
        assert.strictEqual(decodedAccess.email, dummyUser.email);
        assert.strictEqual(decodedAccess.role, dummyUser.role);

        const refreshToken = await jwtUtil.generateRefreshToken(dummyUser);
        assert.ok(typeof refreshToken === 'string' && refreshToken.length > 20, 'Refresh token generated');

        const decodedRefresh = await jwtUtil.verifyRefreshToken(refreshToken);
        assert.strictEqual(decodedRefresh.id, dummyUser._id);
    });

    console.log('\n--- [SECTION 2: Downstream Identity Middleware] ---');

    test('Identity middleware extracts x-user-id, x-user-role, x-request-id', () => {
        const req = {
            headers: {
                'x-user-id': 'user_12345',
                'x-user-role': 'admin',
                'x-request-id': 'req_98765'
            }
        };
        const res = {};
        let nextCalled = false;

        identityMiddleware(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true, 'next() called');
        assert.deepStrictEqual(req.user, { id: 'user_12345', role: 'admin' });
        assert.strictEqual(req.requestId, 'req_98765');
    });

    test('RequireAuth middleware allows authenticated and blocks unauthenticated requests', () => {
        let authReq = { user: { id: 'user_123' } };
        let nextCalled = false;
        requireAuth(authReq, {}, () => { nextCalled = true; });
        assert.strictEqual(nextCalled, true, 'Allowed authenticated request');

        let unauthReq = { user: null };
        let statusCode = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => { responseJson = data; }
                };
            }
        };
        requireAuth(unauthReq, res, () => {});
        assert.strictEqual(statusCode, 401, 'Returns 401 Unauthorized');
        assert.strictEqual(responseJson.success, false);
    });

    console.log('\n--- [SECTION 3: API Gateway Auth Middleware] ---');

    test('API Gateway allows public routes without token', () => {
        const publicRoutes = [
            { method: 'GET', path: '/carnival' },
            { method: 'POST', path: '/api/auth/login' },
            { method: 'POST', path: '/api/auth/register' },
            { method: 'GET', path: '/api/products' }
        ];
        const mockRes = {
            status: () => mockRes,
            json: () => mockRes
        };
        
        for (const route of publicRoutes) {
            const req = { method: route.method, path: route.path, headers: {} };
            let nextCalled = false;
            gatewayAuthMiddleware(req, mockRes, () => { nextCalled = true; });
            assert.strictEqual(nextCalled, true, `Public route ${route.method} ${route.path} passed without token`);
            assert.ok(req.headers['x-request-id'], `x-request-id generated for ${route.path}`);
        }
    });

    test('API Gateway rejects protected routes when access token is missing', () => {
        const req = { method: 'GET', path: '/api/users/profile', headers: {} };
        let statusCode = null;
        let responseJson = null;
        const res = {
            status: (code) => {
                statusCode = code;
                return { json: (data) => { responseJson = data; } };
            }
        };

        gatewayAuthMiddleware(req, res, () => {});
        assert.strictEqual(statusCode, 401, 'Protected route returns 401 when token missing');
        assert.strictEqual(responseJson.code, 'UNAUTHORIZED');
    });

    await testAsync('API Gateway validates access token and injects x-user-id, x-user-role', async () => {
        const dummyUser = { _id: '607f1f77bcf86cd799439099', email: 'gateway_user@example.com', role: 'customer' };
        const token = await jwtUtil.generateAccessToken(dummyUser);

        const req = {
            method: 'GET',
            path: '/api/orders/my-orders',
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        let nextCalled = false;
        gatewayAuthMiddleware(req, {}, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true, 'Access token validated and passed');
        assert.strictEqual(req.headers['x-user-id'], dummyUser._id);
        assert.strictEqual(req.headers['x-user-role'], dummyUser.role);
        assert.ok(req.headers['x-request-id'], 'x-request-id set');
    });

    console.log('\n--- [SECTION 4: Auth Controller HTTP & Cookie behavior] ---');

    await testAsync('Login response returns access token ONLY in JSON body and sets HttpOnly cookie for refresh token', async () => {
        const mockAccessToken = 'mock.access.token';
        const mockRefreshToken = 'mock.refresh.token';

        const originalLogin = authService.login;
        // Mock authService.login
        authService.login = async () => ({
            accessToken: mockAccessToken,
            refreshToken: mockRefreshToken
        });

        const req = { body: { email: 'admin@example.com', password: 'Password123!' } };
        let cookieName = null;
        let cookieVal = null;
        let cookieOpts = null;
        let responseJson = null;

        const res = {
            cookie: (name, val, opts) => {
                cookieName = name;
                cookieVal = val;
                cookieOpts = opts;
            },
            json: (data) => {
                responseJson = data;
                return data;
            }
        };

        await authController.login(req, res, (err) => { if (err) throw err; });

        assert.strictEqual(cookieName, 'refreshToken', 'Cookie name is refreshToken');
        assert.strictEqual(cookieVal, mockRefreshToken, 'Cookie contains refreshToken value');
        assert.strictEqual(cookieOpts.httpOnly, true, 'Cookie is HttpOnly');
        assert.strictEqual(cookieOpts.sameSite, 'lax', 'Cookie sameSite is lax');
        
        assert.ok(responseJson.accessToken || responseJson.token, 'Response contains access token');
        assert.strictEqual(responseJson.refreshToken, undefined, 'Response body MUST NOT contain refresh token!');

        authService.login = originalLogin;
    });

    console.log('\n--- [SECTION 5: AuthService Core Logic Unit Tests] ---');

    await testAsync('AuthService.register creates user and hashes password', async () => {
        const origFindByEmail = authRepo.findByEmail;
        const origAddUser = authRepo.addUser;

        const testEmail = 'newuser@example.com';
        const testPass = 'SecurePass123!';
        
        authRepo.findByEmail = async () => null;
        authRepo.addUser = async (u) => ({ _id: '507f1f77bcf86cd799439022', email: u.email, password: u.password });

        const result = await authService.register(testEmail, testPass);
        assert.strictEqual(result.email, testEmail);
        assert.ok(result.userId, 'User ID returned');

        authRepo.findByEmail = origFindByEmail;
        authRepo.addUser = origAddUser;
    });

    await testAsync('AuthService.login validates password and issues tokens', async () => {
        const origFindByEmail = authRepo.findByEmail;
        const origAddRefreshToken = authRepo.addRefreshToken;

        const testEmail = 'user@example.com';
        const testPass = 'Password123!';
        const hashedPassword = await passwordUtil.hashPassword(testPass);

        authRepo.findByEmail = async () => ({
            _id: '507f1f77bcf86cd799439033',
            email: testEmail,
            password: hashedPassword,
            role: 'user'
        });
        authRepo.addRefreshToken = async () => true;

        const result = await authService.login(testEmail, testPass);
        assert.ok(result.accessToken, 'Access token issued');
        assert.ok(result.refreshToken, 'Refresh token issued');
        assert.strictEqual(result.user.email, testEmail);

        authRepo.findByEmail = origFindByEmail;
        authRepo.addRefreshToken = origAddRefreshToken;
    });

    await testAsync('AuthService.login rejects incorrect password', async () => {
        const origFindByEmail = authRepo.findByEmail;

        const testEmail = 'user@example.com';
        const testPass = 'CorrectPassword123!';
        const hashedPassword = await passwordUtil.hashPassword(testPass);

        authRepo.findByEmail = async () => ({
            _id: '507f1f77bcf86cd799439033',
            email: testEmail,
            password: hashedPassword
        });

        let rejected = false;
        try {
            await authService.login(testEmail, 'WrongPassword123!');
        } catch (err) {
            rejected = true;
            assert.strictEqual(err.status, 401);
            assert.strictEqual(err.message, 'Invalid password');
        }
        assert.strictEqual(rejected, true, 'Login rejected for invalid password');

        authRepo.findByEmail = origFindByEmail;
    });

    await testAsync('AuthService.refreshTokens validates stored refresh token and issues new access token', async () => {
        const origFindByToken = authRepo.findByToken;
        const origFindById = authRepo.findById;

        const userId = '507f1f77bcf86cd799439044';
        const refreshToken = await jwtUtil.generateRefreshToken({ id: userId });

        authRepo.findByToken = async () => ({ userId, token: refreshToken, isRevoked: false });
        authRepo.findById = async () => ({ _id: userId, email: 'refresh@example.com', isActive: true });

        const result = await authService.refreshTokens(refreshToken);
        assert.ok(result.accessToken, 'New access token issued');

        const decoded = await jwtUtil.verifyToken(result.accessToken);
        assert.strictEqual(decoded.id, userId);

        authRepo.findByToken = origFindByToken;
        authRepo.findById = origFindById;
    });

    await testAsync('AuthService.logout revokes refresh token', async () => {
        const origDeleteRefreshToken = authRepo.deleteRefreshToken;
        let tokenDeleted = null;

        authRepo.deleteRefreshToken = async (t) => { tokenDeleted = t; return true; };

        const testToken = 'token_to_delete';
        const result = await authService.logout(testToken);
        assert.strictEqual(result.success, true);
        assert.strictEqual(tokenDeleted, testToken);

        authRepo.deleteRefreshToken = origDeleteRefreshToken;
    });

    console.log('\n--- [SECTION 6: Audit & Request Tracking Middleware Tests] ---');

    const { auditMiddleware, sanitizeData, deriveActionName } = require('./shared/middleware/audit.middleware');

    test('Data sanitization redacts sensitive keys (password, token, creditCard)', () => {
        const rawData = {
            username: 'alice',
            password: 'SuperSecret123',
            token: 'bearer.token.value',
            nested: {
                creditCard: '1234-5678-9012-3456',
                cvv: '123',
                valid: true
            }
        };

        const sanitized = sanitizeData(rawData);
        assert.strictEqual(sanitized.username, 'alice');
        assert.strictEqual(sanitized.password, '[REDACTED]');
        assert.strictEqual(sanitized.token, '[REDACTED]');
        assert.strictEqual(sanitized.nested.creditCard, '[REDACTED]');
        assert.strictEqual(sanitized.nested.cvv, '[REDACTED]');
        assert.strictEqual(sanitized.nested.valid, true);
    });

    test('DeriveActionName maps endpoints to human readable actions', () => {
        assert.strictEqual(deriveActionName('POST', '/api/auth/register'), 'REGISTER');
        assert.strictEqual(deriveActionName('POST', '/api/auth/login'), 'LOGIN');
        assert.strictEqual(deriveActionName('POST', '/api/orders'), 'CREATE_ORDER');
        assert.strictEqual(deriveActionName('POST', '/api/products'), 'CREATE_PRODUCT');
        assert.strictEqual(deriveActionName('POST', '/api/payments'), 'PROCESS_PAYMENT');
        assert.strictEqual(deriveActionName('GET', '/api/users/list'), 'GET_USERS_LIST');
    });

    await testAsync('AuditMiddleware logs request, duration, result, and status code', async () => {
        const middleware = auditMiddleware('order-service');
        const req = {
            method: 'POST',
            path: '/orders',
            headers: {
                'x-request-id': 'req-audit-12345',
                'x-user-id': 'user-audit-67890'
            },
            user: { id: 'user-audit-67890' },
            body: { productId: 'PROD-101', quantity: 2 }
        };

        let finishCallback = null;
        const res = {
            statusCode: 201,
            json: function (data) { return data; },
            send: function (data) { return data; },
            on: function (event, cb) {
                if (event === 'finish') finishCallback = cb;
            }
        };

        let nextCalled = false;
        middleware(req, res, () => { nextCalled = true; });
        assert.strictEqual(nextCalled, true, 'Next called by middleware');

        // Simulate response finish
        if (finishCallback) await finishCallback();

        assert.ok(global.__TEST_AUDIT_LOGS__ && global.__TEST_AUDIT_LOGS__.length > 0, 'Audit log recorded');
        const lastLog = global.__TEST_AUDIT_LOGS__[global.__TEST_AUDIT_LOGS__.length - 1];

        assert.strictEqual(lastLog.requestId, 'req-audit-12345');
        assert.strictEqual(lastLog.userId, 'user-audit-67890');
        assert.strictEqual(lastLog.service, 'order-service');
        assert.strictEqual(lastLog.action, 'CREATE_ORDER');
        assert.strictEqual(lastLog.result, 'SUCCESS');
        assert.strictEqual(typeof lastLog.durationMs, 'number');
        assert.ok(lastLog.durationMs >= 0);
    });

    console.log('\n====================================================');
    console.log(`  SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================\n');

    if (failedCount > 0) {
        process.exit(1);
    }
}

runTests();

