const authService = require('../services/auth.service');

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

class AuthController {
    async register(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.register(email, password);
            return res.status(201).json({
                message: 'User created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { accessToken, refreshToken } = await authService.login(email, password);

            // Store refresh token strictly in an HttpOnly cookie
            res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

            // Return ONLY the access token in JSON body
            return res.json({
                token: accessToken,
                accessToken
            });
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            const { accessToken } = await authService.refreshTokens(refreshToken);
            return res.json({
                token: accessToken,
                accessToken
            });
        } catch (error) {
            next(error);
        }
    }

    async generateRefreshToken(req, res, next) {
        return this.refresh(req, res, next);
    }

    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            await authService.logout(refreshToken);
            res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
            return res.json({ success: true, message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            return res.json({ success: true, message: 'Password reset token generated', ...result });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            await authService.resetPassword(token, newPassword);
            return res.json({ success: true, message: 'Password reset successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();