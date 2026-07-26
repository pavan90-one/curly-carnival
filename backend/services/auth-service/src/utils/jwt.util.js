const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JwtUtil {
    constructor() {
        this.accessSecret = config.accessSecret;
        this.refreshSecret = config.refreshSecret;
    }
    async generateToken(payload) {
        return jwt.sign(payload, this.accessSecret, { expiresIn: config.accessTokenTime });
    }
    async generateAccessToken(user) {
        const payload = typeof user === 'object' && user ? { id: user._id || user.id, email: user.email, role: user.role } : user;
        return this.generateToken(payload);
    }
    async generateRefreshToken(payload) {

        return jwt.sign(payload, this.refreshSecret, { expiresIn: config.refreshTokenTime });
    }
    async verifyToken(token) {
        return jwt.verify(token, this.accessSecret);    
    }
    async verifyRefreshToken(token) {
        return jwt.verify(token, this.refreshSecret);
    }
    async decodeToken(token) {
        return jwt.decode(token);
    }
}
module.exports = new JwtUtil();