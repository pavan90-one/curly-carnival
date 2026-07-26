const express = require('express');
const app = express(); app.use(express.json());
const cors = require('cors');
const joi = require('joi');
app.use(cors());
app.use(express.json());
const userRoutes = require('./routes/user.routes');
const connectDB = require('./config/database');
const { connect: connectRabbitMQ, consumeQueue, queues } = require('../../../shared/messaging/src/index');

connectDB().then(async () => {
    console.log('Database connected successfully');
    await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in user-service:", err.message));
    
    // Subscribe user-service to USER_QUEUE messages
    consumeQueue(queues.USER_QUEUE, async (data) => {
        console.log('[user-service] Received message on USER_QUEUE:', data);
    }).catch(err => console.error("Failed to subscribe to USER_QUEUE:", err.message));

}).catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
});
app.get('/', (req, res) => {
  res.send('User services is running');
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
})


app.listen(process.env.PORT || 4001, () => console.log('user-service ready'));
