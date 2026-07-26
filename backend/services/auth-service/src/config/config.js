const dotenv = require('dotenv');
dotenv.config();
const config = {
  port: Number(process.env.PORT) || 4006,
  accessSecret: process.env.ACCESS_TOKEN_SECRET || 'development-access-secret-change-me',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret-change-me',
  hashkey: process.env.HASH_KEY || 'development-hash-key-change-me',
  refreshTokenTime: process.env.REFRESH_TOKEN_TIME || '7d',
  accessTokenTime: process.env.ACCESS_TOKEN_TIME || '15m',
  mongoUri: (process.env.MONGO_URI || process.env.MONGO_DB || "mongodb://127.0.0.1:27017/smart-commerce-auth").replace(/^DATABASE_URL=/, '')
};


module.exports = config;

