const app = require('./app');
const config = require("./config/config");
const connectDB = require("./config/db");
const { connect: connectRabbitMQ, consumeQueue, queues } = require('../../../shared/messaging/src/index');

connectDB().then(async () => {
    console.log("Database connected successfully");
    await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in product-service:", err.message));
    
    consumeQueue(queues.PRODUCT_QUEUE, async (data) => {
        console.log('[product-service] Received message on PRODUCT_QUEUE:', data);
    }).catch(err => console.error("Failed to subscribe to PRODUCT_QUEUE:", err.message));

    app.listen(config.port, () => console.log(`product-service listening on port: http://localhost:${config.port}`));
}).catch((err)=>{
    console.error("Database connection error:", err);
    process.exit(1);
});

