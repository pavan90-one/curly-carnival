const app = require('./app');
const config = require("./config/config");
const connectDB = require("./config/db");
const { connect: connectRabbitMQ, consumeQueue, queues } = require('../../../shared/messaging/src/index');

connectDB().then(async () => {
    console.log("Database connected successfully");
    await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in order-service:", err.message));

    // Subscribe to ORDER_QUEUE for status updates / payment results
    consumeQueue(queues.ORDER_QUEUE, async (data) => {
        console.log('[order-service] Received message on ORDER_QUEUE:', data);
    }).catch(err => console.error("Failed to subscribe to ORDER_QUEUE:", err.message));

    app.listen(config.port, () => console.log(`order-service listening on port: http://localhost:${config.port}`));
}).catch((err)=>{
    console.error("Database connection error:", err);
    process.exit(1);
});
