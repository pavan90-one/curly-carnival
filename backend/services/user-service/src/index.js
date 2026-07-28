const express = require('express');
const app = express(); app.use(express.json());
const cors = require('cors');
const joi = require('joi');
const { identityMiddleware } = require('../../../shared/middleware/identity.middleware');
const { auditMiddleware } = require('../../../shared/middleware/audit.middleware');
app.use(cors());
app.use(express.json());
app.use(identityMiddleware);
app.use(auditMiddleware('user-service'));
const userRoutes = require('./routes/user.routes');


const connectDB = require('./config/database');
const User = require('./models/user.model');
const { createUser } = require('./repositories/user.repositories');
const { connect: connectRabbitMQ, consumeQueue, event_list, queues } = require('../../../shared/messaging/src/index');

connectDB().then(async () => {
    console.log('Database connected successfully');
    await connectRabbitMQ().catch(err => console.error("RabbitMQ connection error in user-service:", err.message));
    
    // Subscribe user-service to USER_QUEUE messages and process queue jobs
    consumeQueue(queues.USER_QUEUE, async (data) => {
        console.log('[user-service] Received message on USER_QUEUE:', data);
        if (!data || !data.userId) return;

        if (data.event === event_list.USER_CREATED) {
            try {
                const existingUser = await User.findOne({ authUserId: data.userId });
                if (!existingUser) {
                    const newUser = await createUser({
                        authUserId: data.userId,
                        userEmail: data.email || `${data.userId}@example.com`,
                        userName: data.email ? data.email.split('@')[0] : 'NewUser',
                        firstName: data.email ? data.email.split('@')[0] : 'NewUser'
                    });
                    console.log(`[user-service] ✅ Created user profile record for authUserId: ${data.userId}`);
                }
            } catch (err) {
                console.error('[user-service] Error creating user profile from queue:', err.message);
            }
        } else if (data.event === event_list.USER_UPDATED) {
            try {
                const updated = await User.findOneAndUpdate({ authUserId: data.userId }, data.updateData || data, { new: true });
                console.log(`[user-service] ✅ Updated user profile for authUserId: ${data.userId}`);
            } catch (err) {
                console.error('[user-service] Error updating user profile from queue:', err.message);
            }
        }
    }).catch(err => console.error("Failed to subscribe to USER_QUEUE:", err.message));

}).catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
});
app.use('/user', userRoutes);
app.use('/users', userRoutes);

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
