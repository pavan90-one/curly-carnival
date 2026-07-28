const jwt = require('jsonwebtoken');
const config = require("../config/config");
const DEFAULT_ACCESS_SECRET = config.JWT.ACCESS_TOKEN_SECRET;
const DEFAULT_REFRESH_SECRET = config.JWT.REFRESH_TOKEN_SECRET;
const DEFAULT_ACCESS_EXPIRY = config.JWT.ACCESS_TOKEN_TIME;
const DEFAULT_REFRESH_EXPIRY = config.JWT.REFRESH_TOKEN_TIME;

class JwtUtil {
    constructor(options = {}) {
        this.accessSecret = options.accessSecret || DEFAULT_ACCESS_SECRET;
        this.refreshSecret = options.refreshSecret || DEFAULT_REFRESH_SECRET;
        this.accessTokenTime = options.accessTokenTime || DEFAULT_ACCESS_EXPIRY;
        this.refreshTokenTime = options.refreshTokenTime || DEFAULT_REFRESH_EXPIRY;
    }

    generateToken(payload, secret = this.accessSecret, expiresIn = this.accessTokenTime) {
        return jwt.sign(payload, secret, { expiresIn });
    }

    generateAccessToken(user) {
        const payload = typeof user === 'object' && user ? { id: (user._id || user.id)?.toString(), email: user.email, role: user.role || 'user' } : user;
        return this.generateToken(payload, this.accessSecret, this.accessTokenTime);
    }

    generateRefreshToken(payload) {
        const tokenPayload = typeof payload === 'object' && payload ? { id: (payload._id || payload.id)?.toString() } : payload;
        return jwt.sign(tokenPayload, this.refreshSecret, { expiresIn: this.refreshTokenTime });
    }

    verifyToken(token, secret = this.accessSecret) {
        return jwt.verify(token, secret);
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, this.refreshSecret);
    }

    decodeToken(token) {
        return jwt.decode(token);
    }
}

module.exports = new JwtUtil();
