const app = require('./app');
const { port } = require('./config/config');
const connectDB = require('./config/db');
const { connect: connectRabbitMQ } = require('../../../shared/messaging/src/index');

connectDB()
    .then(async () => {
        await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in auth-service:", err.message));
        app.listen(port, () => console.log(`auth-service listening on ${port}`));
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });