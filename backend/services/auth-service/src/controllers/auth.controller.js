const jwt = require('jsonwebtoken');
const { accessSecret, refreshSecret } = require('../config/config');
const authRepo = require('../repositories/auth.repository');
const PasswordUtil = require('../utils/password.util');
const jwtUtil = require('../utils/jwt.util');
const cookieParser = require('cookie-parser');
const { bus, event_list, queues } = require('../../../../shared/messaging/src/index');
const cookieInterval = 1;
class AuthController {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await authRepo.findByEmail(email);
            if (user) {
                return res.status(400).json({ error: 'User already exists' });
            }
            const hashedPassword = await PasswordUtil.hashPassword(password);
            const newUser = await authRepo.addUser({ email: email, password: hashedPassword });

            // Publish USER_CREATED event to RabbitMQ
            try {
                await bus.sendToQueue(queues.NOTIFICATION_QUEUE, {
                    event: event_list.USER_CREATED,
                    userId: newUser._id,
                    email: newUser.email,
                    timestamp: new Date().toISOString()
                });
                await bus.sendToQueue(queues.USER_QUEUE, {
                    event: event_list.USER_CREATED,
                    userId: newUser._id,
                    email: newUser.email,
                    timestamp: new Date().toISOString()
                });
            } catch (mqErr) {
                console.error('Failed to publish USER_CREATED event:', mqErr.message);
            }

            return res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            next(error);
        }

    }
    async login(req, res) {
        const user = await authRepo.findByEmail(req.body.email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const validPassword = await PasswordUtil.comparePassword(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = await jwtUtil.generateToken({ id: user._id });
        const refreshToken = await jwtUtil.generateRefreshToken({ id: user._id });
        await authRepo.addRefreshToken(user._id, refreshToken);
        res.cookie('refreshToken', refreshToken, {

            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: cookieInterval
        });
        return res.json({ token, refreshToken });
    }
    async refresh(req, res) {
        const { refreshToken } = req.body;
        const decodedToken = await jwtUtil.verifyRefreshToken(refreshToken);
        const token = await jwtUtil.generateToken({ id: decodedToken.id });
        return res.json({ token });
    }
    async generateRefreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        try {
            const payload = await jwtUtil.verifyRefreshToken(refreshToken);

            const storedToken = await authRepo.findByToken(refreshToken);

            if (!storedToken) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid refresh token"
                });
            }

            const user = await authRepo.findById(payload.id);

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            const accessToken = await jwtUtil.generateAccessToken(user);

            return res.json({
                success: true,
                accessToken
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }
    }

    async logout(req, res) {
        try {
            const refreshToken = req.body?.refreshToken || req.cookies?.refreshToken;
            if (refreshToken) {
                await authRepo.deleteRefreshToken(refreshToken);
            }
            res.clearCookie('refreshToken');
            return res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await authRepo.findByEmail(email);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            const token = jwtUtil.generateToken ? await jwtUtil.generateToken({ id: user._id }) : 'reset-token-' + Date.now();
            await authRepo.addResetToken(token, user._id.toString());
            return res.json({ success: true, message: 'Password reset token generated', token });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({ success: false, message: 'Token and newPassword are required' });
            }
            const hashedPassword = await PasswordUtil.hashPassword(newPassword);
            await authRepo.deleteResetToken(token);
            return res.json({ success: true, message: 'Password reset successfully' });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();  