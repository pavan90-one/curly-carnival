const app = require('./app');
const { port } = require('./config/config');
const { connect: connectRabbitMQ, consumeQueue, queues } = require('../../../shared/messaging/src/index');

async function start() {
    await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in notification-service:", err.message));

    // Subscribe notification-service to NOTIFICATION_QUEUE
    consumeQueue(queues.NOTIFICATION_QUEUE, async (data) => {
        console.log(`[notification-service] 🔔 Received Event [${data.event || 'UNKNOWN'}]:`, JSON.stringify(data, null, 2));
    }).catch(err => console.error("Failed to subscribe to NOTIFICATION_QUEUE:", err.message));

    app.listen(port, () => console.log(`notification-service listening on port ${port}`));
}

start();
