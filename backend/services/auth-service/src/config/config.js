const dotenv = require('dotenv');
const sharedConfig = require('../../../../shared/config/config');

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 4006,
  accessSecret: sharedConfig.JWT.ACCESS_TOKEN_SECRET,
  refreshSecret: sharedConfig.JWT.REFRESH_TOKEN_SECRET,
  hashkey: sharedConfig.hashkey || sharedConfig.HASH.HASH_KEY,
  refreshTokenTime: sharedConfig.JWT.REFRESH_TOKEN_TIME,
  accessTokenTime: sharedConfig.JWT.ACCESS_TOKEN_TIME,
  mongoUri: (process.env.MONGO_URI || process.env.MONGO_DB || "mongodb://127.0.0.1:27017/smart-commerce-auth").replace(/^DATABASE_URL=/, '')
};

module.exports = config;
