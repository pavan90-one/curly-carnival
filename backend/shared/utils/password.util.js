const crypto = require('crypto');
const config = require('../config/config');

const DEFAULT_HASH_KEY = config.HASH.HASH_KEY;

class PasswordUtil {
    constructor(hashkey = DEFAULT_HASH_KEY) {
        this.hashkey = hashkey || '';
    }

    async hashPassword(password) {
        const salt = crypto.randomBytes(32).toString('hex');
        const pepperedPassword = password + this.hashkey;
        const hash = crypto.scryptSync(pepperedPassword, salt, 64).toString('hex');
        return `${salt}:${hash}`;
    }

    async comparePassword(password, storedHash) {
        if (!storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
            return false;
        }
        const [salt, originalHash] = storedHash.split(':');
        const pepperedPassword = password + this.hashkey;
        const hash = crypto.scryptSync(pepperedPassword, salt, 64).toString('hex');
        
        const keyBuffer = Buffer.from(hash, 'hex');
        const originalBuffer = Buffer.from(originalHash, 'hex');
        
        if (keyBuffer.length !== originalBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(keyBuffer, originalBuffer);
    }
}

module.exports = new PasswordUtil();
