const jwt = require('jsonwebtoken');
const { accessSecret, refreshSecret } = require('../config/config');
const authRepo = require('../repositories/auth.repository');
const PasswordUtil = require('../utils/password.util');
const jwtUtil = require('../utils/jwt.util');
const cookieParser = require('cookie-parser');
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

}

module.exports = new AuthController();  