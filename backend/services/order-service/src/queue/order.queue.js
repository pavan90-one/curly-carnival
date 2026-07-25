const { Queue, Worker } = require('bullmq');
const EventEmitter = require('events');
const orderRepository = require('../repositories/order.repository');
const repository = new orderRepository(require('../models/order.model'));

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4002';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4004';

const connection = { host: REDIS_HOST, port: REDIS_PORT, maxRetriesPerRequest: null };

let orderQueue = null;
let orderWorker = null;
let useFallbackQueue = false;

// Fallback in-memory queue when Redis is not available
class InMemoryQueue extends EventEmitter {
    async add(name, data) {
        console.log(`[InMemoryQueue] Enqueued job '${name}' for Order ID: ${data.orderId}`);
        setImmediate(() => this.emit('job', { name, data }));
    }
}
const fallbackQueue = new InMemoryQueue();

fallbackQueue.on('job', async ({ data }) => {
    await processOrderJob(data);
});

// Primary job processing logic
async function processOrderJob(data) {
    const { orderId, userId, items, totalAmount } = data;
    console.log(`[OrderQueueWorker] Processing Order ID: ${orderId} for User ID: ${userId || 'N/A'}`);

    try {
        // Step 1: Fetch and verify User Details from User Service
        if (userId) {
            console.log(`[OrderQueueWorker] Fetching user details for User ${userId}...`);
            try {
                const userRes = await fetch(`${USER_SERVICE_URL}/users/${userId}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    console.log(`[OrderQueueWorker] User verified: ${userData.userName || userData.userEmail || userId}`);
                } else {
                    console.warn(`[OrderQueueWorker] User Service returned status ${userRes.status} for User ${userId}`);
                }
            } catch (userErr) {
                console.warn(`[OrderQueueWorker] User Service unreachable for User ${userId}: ${userErr.message}`);
            }
        }

        // Step 2: Reduce stock in Product Service
        console.log(`[OrderQueueWorker] Calling Product Service to reduce stock for Order ${orderId}...`);
        const stockRes = await fetch(`${PRODUCT_SERVICE_URL}/products/reduce-stock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        const stockData = await stockRes.json();

        if (!stockRes.ok) {
            console.error(`[OrderQueueWorker] Stock reduction failed: ${stockData.error || stockData.message}`);
            await repository.updateOrder(orderId, { status: 'cancelled', paymentStatus: 'failed' });
            return { success: false, reason: stockData.error || 'Out of stock' };
        }

        // Step 2: Call Payment Service
        console.log(`[OrderQueueWorker] Calling Payment Service for Order ${orderId}...`);
        const paymentRes = await fetch(`${PAYMENT_SERVICE_URL}/payments/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, amount: totalAmount })
        });
        const paymentData = await paymentRes.json();

        if (!paymentRes.ok || !paymentData.success) {
            console.error(`[OrderQueueWorker] Payment failed for Order ${orderId}. Restoring stock...`);
            // Restore stock if payment failed
            await fetch(`${PRODUCT_SERVICE_URL}/products/restore-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
            await repository.updateOrder(orderId, { status: 'failed', paymentStatus: 'failed' });
            return { success: false, reason: 'Payment failed' };
        }

        // Step 3: Update Order to Completed & Paid
        console.log(`[OrderQueueWorker] Order ${orderId} successfully processed & paid!`);
        await repository.updateOrder(orderId, { status: 'completed', paymentStatus: 'paid' });
        return { success: true };
    } catch (error) {
        console.error(`[OrderQueueWorker] System error processing order ${orderId}:`, error.message);
        await repository.updateOrder(orderId, { status: 'failed', paymentStatus: 'failed' });
        throw error;
    }
}

// Initialize BullMQ Queue & Worker
function initQueue() {
    try {
        orderQueue = new Queue('order-processing-queue', { connection });
        orderWorker = new Worker('order-processing-queue', async (job) => {
            return await processOrderJob(job.data);
        }, { connection });

        orderWorker.on('completed', (job) => {
            console.log(`[BullMQWorker] Job ${job.id} for Order ${job.data.orderId} completed successfully.`);
        });

        orderWorker.on('failed', (job, err) => {
            console.error(`[BullMQWorker] Job ${job.id} for Order ${job.data.orderId} failed: ${err.message}`);
        });

        console.log(`[OrderQueue] Initialized BullMQ connecting to Redis ${REDIS_HOST}:${REDIS_PORT}`);
    } catch (err) {
        console.warn(`[OrderQueue] Redis connection unavailable (${err.message}). Using in-memory fallback queue.`);
        useFallbackQueue = true;
    }
}

initQueue();

async function addOrderJob(orderData) {
    if (useFallbackQueue || !orderQueue) {
        await fallbackQueue.add('process-order', orderData);
    } else {
        try {
            await orderQueue.add('process-order', orderData);
            console.log(`[BullMQQueue] Added order ${orderData.orderId} to BullMQ queue`);
        } catch (err) {
            console.warn(`[OrderQueue] Failed to push to Redis BullMQ: ${err.message}. Fallback to in-memory processing.`);
            await fallbackQueue.add('process-order', orderData);
        }
    }
}

module.exports = { addOrderJob, processOrderJob };
