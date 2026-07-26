const authModel = require('../models/auth.model');
const refreshTokenModel = require('../models/refreshToken.model');
const config = require("../config/config");
class AuthRepository {
    constructor() {
        this.resetTokens = new Map();
    }
    async findByEmail(email) {
        try {
            return await authModel.findOne({ email });
        } catch (error) {
            throw error;
        }
    }
    async findById(id) {
        try {
            return await authModel.findById(id);
        } catch (error) {
            throw error;
        }
    }
    async addUser(user) {
        try {
            return await authModel.create(user);
        } catch (error) {
            throw error;
        }
    }
    async addRefreshToken(userId, token, expiresAt) {
        try {
            if (typeof userId === 'string' && !token) {
                token = userId;
                userId = null;
            }
            if (!expiresAt) {
                const durationMs = typeof config.refreshTokenTime === 'number' ? config.refreshTokenTime : (7 * 24 * 60 * 60 * 1000);
                expiresAt = new Date(Date.now() + durationMs);
            }

            return await refreshTokenModel.create({
                userId,
                token,
                expiresAt,
                isRevoked: false
            });
        } catch (error) {
            throw error;
        }
    }
    async deleteRefreshToken(token) {
        try {
            return await refreshTokenModel.findOneAndUpdate({ token }, { isRevoked: true }, { new: true });
        } catch (error) {
            throw error;
        }
    }
    async addResetToken(token, userId) {
        try {
            return this.resetTokens.set(token, { userId, expiresAt: Date.now() + 900000 });
        } catch (error) {
            throw error;
        }
    }
    async deleteResetToken(token) {
        try {
            return this.resetTokens.delete(token);
        } catch (error) {
            throw error;
        }
    }
    async findByToken(token) {
        try {
            return await refreshTokenModel.findOne({
                token,
                isRevoked: false,
                expiresAt: { $gt: new Date() }
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthRepository();