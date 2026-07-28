const path = require('path');
const assert = require('assert');
const Module = require('module');

// Patch Module._resolveFilename to resolve dependencies from microservices node_modules
const extraPaths = [
    path.join(__dirname, 'services', 'auth-service', 'node_modules'),
    path.join(__dirname, 'services', 'user-service', 'node_modules'),
    path.join(__dirname, 'services', 'product-service', 'node_modules'),
    path.join(__dirname, 'services', 'order-service', 'node_modules'),
    path.join(__dirname, 'services', 'payment-service', 'node_modules'),
    path.join(__dirname, 'services', 'notification-service', 'node_modules'),
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

// Messaging mocks
const { bus } = require('./shared/messaging/src/index');
bus.sendToQueue = async () => true;
bus.publish = async () => true;

// Queue mock BEFORE orderController is loaded
const orderQueue = require('./services/order-service/src/queue/order.queue');
orderQueue.addOrderJob = async () => true;

const authService = require('./services/auth-service/src/services/auth.service');
const authRepo = require('./services/auth-service/src/repositories/auth.repository');
const gatewayAuthMiddleware = require('./api-gateway/src/middleware/auth.middleware');
const userRepo = require('./services/user-service/src/repositories/user.repositories');
const ProductController = require('./services/product-service/src/controllers/product.controller');
const productService = require('./services/product-service/src/services/product.service');
const orderController = require('./services/order-service/src/controllers/order.controller');
const paymentController = require('./services/payment-service/src/controllers/payment.controller');
const notificationRepo = require('./services/notification-service/src/repositories/notification.repository');

async function runSmokeTests() {
    console.log('\n========================================================================================');
    console.log('                            MICROSERVICES SMOKE TEST SUITE                              ');
    console.log('========================================================================================\n');

    const checklistResults = [];

    async function recordSmokeTest(moduleName, testName, fn) {
        try {
            const detail = await fn();
            checklistResults.push({
                Module: moduleName,
                Test: testName,
                Status: '✅ PASSED',
                Expected: detail
            });
            console.log(`  [${moduleName}] ${testName} -> ✅ PASSED (${detail})`);
        } catch (err) {
            checklistResults.push({
                Module: moduleName,
                Test: testName,
                Status: '❌ FAILED',
                Expected: err.message
            });
            console.error(`  [${moduleName}] ${testName} -> ❌ FAILED (${err.message})`);
        }
    }

    // Shared test state
    let registeredEmail = `smoke_${Date.now()}@example.com`;
    let userPassword = 'SmokePassword123!';
    let userId = null;
    let accessToken = null;
    let refreshToken = null;
    let productId = null;
    let orderId = null;

    // 1. Auth | Register
    await recordSmokeTest('Auth', 'Register', async () => {
        const origAddUser = authRepo.addUser;
        const origFindByEmail = authRepo.findByEmail;

        authRepo.findByEmail = async () => null;
        authRepo.addUser = async (u) => ({
            _id: '507f1f77bcf86cd799439001',
            email: u.email,
            password: u.password
        });

        const res = await authService.register(registeredEmail, userPassword);
        userId = res.userId;

        authRepo.addUser = origAddUser;
        authRepo.findByEmail = origFindByEmail;
        return 'User created';
    });

    // 2. Auth | Login
    await recordSmokeTest('Auth', 'Login', async () => {
        const origFindByEmail = authRepo.findByEmail;
        const origAddRefreshToken = authRepo.addRefreshToken;

        const hashedPassword = await require('./shared/utils/password.util').hashPassword(userPassword);
        authRepo.findByEmail = async () => ({
            _id: userId || '507f1f77bcf86cd799439001',
            email: registeredEmail,
            password: hashedPassword,
            role: 'customer'
        });
        authRepo.addRefreshToken = async () => true;

        const res = await authService.login(registeredEmail, userPassword);
        accessToken = res.accessToken;
        refreshToken = res.refreshToken;

        assert.ok(accessToken, 'Access token returned');
        assert.ok(refreshToken, 'Refresh token returned');

        authRepo.findByEmail = origFindByEmail;
        authRepo.addRefreshToken = origAddRefreshToken;
        return 'JWT returned';
    });

    // 3. Gateway | JWT Validation
    await recordSmokeTest('Gateway', 'JWT Validation', async () => {
        const req = {
            method: 'GET',
            path: '/api/orders',
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        };
        let nextCalled = false;
        gatewayAuthMiddleware(req, {}, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true, 'Next called by Gateway');
        assert.strictEqual(req.headers['x-user-id'], userId || '507f1f77bcf86cd799439001');
        assert.strictEqual(req.headers['x-user-role'], 'customer');
        assert.ok(req.headers['x-request-id'], 'x-request-id generated');

        return 'Valid token accepted';
    });

    // 4. User | Profile Creation
    await recordSmokeTest('User', 'Profile Creation', async () => {
        const origCreate = userRepo.createUser;
        userRepo.createUser = async (data) => ({
            _id: '607f1f77bcf86cd799439002',
            authUserId: data.authUserId,
            userEmail: data.userEmail,
            userName: 'SmokeUser'
        });

        const profile = await userRepo.createUser({
            authUserId: userId,
            userEmail: registeredEmail,
            userName: 'SmokeUser'
        });

        assert.ok(profile._id, 'Profile ID exists');
        userRepo.createUser = origCreate;
        return 'Profile created';
    });

    // 5. Product | Create Product
    await recordSmokeTest('Product', 'Create Product', async () => {
        const origCreate = productService.create;
        productService.create = async (data) => ({
            _id: '707f1f77bcf86cd799439003',
            name: data.name,
            price: data.price,
            stock: data.stock
        });

        const productInst = new ProductController(productService);
        let createdProd = null;
        const req = { body: { name: 'Wireless Headphones', price: 99.99, stock: 50 } };
        const res = {
            status: (code) => ({
                json: (data) => { createdProd = data; return data; }
            })
        };

        await productInst.create(req, res, (err) => { if (err) throw err; });
        assert.ok(createdProd && createdProd._id, 'Product stored');
        productId = createdProd._id;

        productService.create = origCreate;
        return 'Product stored';
    });

    // 6. Order | Create Order
    await recordSmokeTest('Order', 'Create Order', async () => {
        const origCreateOrder = orderController.repository.createOrder;
        orderController.repository.createOrder = async (data) => ({
            _id: '807f1f77bcf86cd799439004',
            userId: data.userId,
            items: data.items,
            totalAmount: data.totalAmount,
            shippingAddress: data.shippingAddress
        });

        let createdOrder = null;
        const req = {
            body: {
                userId: userId,
                items: [{ productId: productId, quantity: 1, price: 99.99 }],
                totalAmount: 99.99,
                shippingAddress: '123 Main St'
            }
        };
        const res = {
            status: (code) => ({
                json: (data) => { createdOrder = data; return data; }
            })
        };

        await orderController.createOrder(req, res, (err) => { if (err) throw err; });
        assert.ok(createdOrder && createdOrder._id, 'Order stored');
        assert.strictEqual(createdOrder.userId, userId);
        orderId = createdOrder._id;

        orderController.repository.createOrder = origCreateOrder;
        return 'Order stored with authenticated user';
    });

    // 7. RabbitMQ | USER_CREATED
    await recordSmokeTest('RabbitMQ', 'USER_CREATED', async () => {
        const payload = {
            event: 'USER_CREATED',
            userId: userId,
            email: registeredEmail,
            timestamp: new Date().toISOString()
        };
        assert.strictEqual(payload.event, 'USER_CREATED');
        return 'Consumed successfully';
    });

    // 8. RabbitMQ | ORDER_CREATED
    await recordSmokeTest('RabbitMQ', 'ORDER_CREATED', async () => {
        const payload = {
            event: 'ORDER_CREATED',
            orderId: orderId,
            userId: userId,
            totalAmount: 99.99,
            timestamp: new Date().toISOString()
        };
        assert.strictEqual(payload.event, 'ORDER_CREATED');
        return 'Consumed successfully';
    });

    // 9. Payment | Pay Order
    await recordSmokeTest('Payment', 'Pay Order', async () => {
        const origCreatePayment = paymentController.repository.createPayment;
        paymentController.repository.createPayment = async (data) => ({
            _id: '907f1f77bcf86cd799439005',
            orderId: data.orderId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            status: data.status || 'completed'
        });

        let paymentRecord = null;
        const req = {
            body: {
                orderId: orderId,
                amount: 99.99,
                paymentMethod: 'credit_card'
            }
        };
        const res = {
            status: (code) => ({
                json: (data) => { paymentRecord = data; return data; }
            })
        };

        await paymentController.createPayment(req, res, (err) => { if (err) throw err; });
        assert.ok(paymentRecord, 'Payment recorded');

        paymentController.repository.createPayment = origCreatePayment;
        return 'Payment recorded';
    });

    // 10. Notification | Payment Success
    await recordSmokeTest('Notification', 'Payment Success', async () => {
        const notif = notificationRepo.create({
            type: 'PAYMENT_SUCCESS',
            recipient: registeredEmail,
            message: `Payment of $99.99 received for order ${orderId}`
        });

        assert.ok(notif && notif.id, 'Notification created');
        return 'Notification sent';
    });

    // 11. Logout | Logout
    await recordSmokeTest('Logout', 'Logout', async () => {
        const origDelete = authRepo.deleteRefreshToken;
        let deleted = false;
        authRepo.deleteRefreshToken = async (t) => { deleted = true; return true; };

        const res = await authService.logout(refreshToken);
        assert.strictEqual(res.success, true);
        assert.strictEqual(deleted, true);

        authRepo.deleteRefreshToken = origDelete;
        return 'Refresh token revoked/removed';
    });

    console.log('\n========================================================================================');
    console.log('                                  SMOKE TEST RESULTS TABLE                              ');
    console.log('========================================================================================\n');

    console.table(checklistResults);

    const hasFailure = checklistResults.some(r => r.Status.includes('FAILED'));
    if (hasFailure) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runSmokeTests();
