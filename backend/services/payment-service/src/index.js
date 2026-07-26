const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/db');
const { connect: connectRabbitMQ, consumeQueue, bus, event_list, queues } = require('../../../shared/messaging/src/index');


connectDB().then(async () => {
    console.log("Database connected successfully");
    await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in payment-service:", err.message));

    // Subscribe to PAYMENT_QUEUE to auto-process payment events from ORDER_CREATED
    consumeQueue(queues.PAYMENT_QUEUE, async (data) => {
        console.log('[payment-service] Received message on PAYMENT_QUEUE:', data);
        if (data && data.event === event_list.ORDER_CREATED) {
            console.log(`[payment-service] Processing payment for Order ID: ${data.orderId}, Amount: ${data.totalAmount}`);
            // Publish PAYMENT_SUCCESS event to ORDER_QUEUE and NOTIFICATION_QUEUE
            try {
                const paymentPayload = {
                    event: event_list.PAYMENT_SUCCESS,
                    orderId: data.orderId,
                    amount: data.totalAmount,
                    status: 'completed',
                    timestamp: new Date().toISOString()
                };
                await bus.sendToQueue(queues.ORDER_QUEUE, paymentPayload);
                await bus.sendToQueue(queues.NOTIFICATION_QUEUE, paymentPayload);
            } catch (err) {
                console.error('[payment-service] Error publishing PAYMENT_SUCCESS:', err.message);
            }
        }
    }).catch(err => console.error("Failed to subscribe to PAYMENT_QUEUE:", err.message));

    app.listen(config.port, () => console.log(`payment-service listening on port: http://localhost:${config.port}`));
}).catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
});
