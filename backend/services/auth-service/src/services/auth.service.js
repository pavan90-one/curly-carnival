const authRepo = require('../repositories/auth.repository');
const passwordUtil = require('../utils/password.util');
const jwtUtil = require('../utils/jwt.util');
const { bus, event_list, queues } = require('../../../../shared/messaging/src/index');

class AuthService {
    async register(email, password) {
        const existingUser = await authRepo.findByEmail(email);
        if (existingUser) {
            const error = new Error('User already exists');
            error.status = 400;
            throw error;
        }

        const hashedPassword = await passwordUtil.hashPassword(password);
        const newUser = await authRepo.addUser({ email, password: hashedPassword });

        // Publish USER_CREATED event to RabbitMQ
        try {
            const eventPayload = {
                event: event_list.USER_CREATED,
                userId: newUser._id,
                email: newUser.email,
                timestamp: new Date().toISOString()
            };
            await bus.sendToQueue(queues.NOTIFICATION_QUEUE, eventPayload);
            await bus.sendToQueue(queues.USER_QUEUE, eventPayload);
        } catch (mqErr) {
            console.error('[AuthService] Failed to publish USER_CREATED event:', mqErr.message);
        }

        return { userId: newUser._id, email: newUser.email };
    }

    async login(email, password) {
        const user = await authRepo.findByEmail(email);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        const validPassword = await passwordUtil.comparePassword(password, user.password);
        if (!validPassword) {
            const error = new Error('Invalid password');
            error.status = 401;
            throw error;
        }

        const accessToken = await jwtUtil.generateAccessToken(user);
        const refreshToken = await jwtUtil.generateRefreshToken(user);

        await authRepo.addRefreshToken(user._id, refreshToken);

        return {
            user: { id: user._id, email: user.email, role: user.role || 'user' },
            accessToken,
            refreshToken
        };
    }

    async refreshTokens(refreshToken) {
        if (!refreshToken) {
            const error = new Error('Refresh token is required');
            error.status = 400;
            throw error;
        }

        const decodedToken = await jwtUtil.verifyRefreshToken(refreshToken);
        const storedToken = await authRepo.findByToken(refreshToken);

        if (!storedToken) {
            const error = new Error('Invalid or revoked refresh token');
            error.status = 401;
            throw error;
        }

        const user = await authRepo.findById(decodedToken.id);
        if (!user || user.isActive === false) {
            const error = new Error('User inactive or not found');
            error.status = 401;
            throw error;
        }

        const accessToken = await jwtUtil.generateAccessToken(user);

        return {
            accessToken
        };
    }

    async logout(refreshToken) {
        if (refreshToken) {
            await authRepo.deleteRefreshToken(refreshToken);
        }
        return { success: true };
    }

    async forgotPassword(email) {
        const user = await authRepo.findByEmail(email);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        const token = await jwtUtil.generateToken({ id: user._id });
        await authRepo.addResetToken(token, user._id.toString());
        return { token };
    }

    async resetPassword(token, newPassword) {
        if (!token || !newPassword) {
            const error = new Error('Token and newPassword are required');
            error.status = 400;
            throw error;
        }

        await authRepo.deleteResetToken(token);
        return { success: true };
    }
}

module.exports = new AuthService();
