const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from shared .env file if available
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // Fallback to current working directory .env

const hashkey = process.env.HASH_KEY || 'development-hash-key-change-me';

const config = {
  hashkey,
  HASH: {
    HASH_KEY: hashkey
  },
  JWT: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'development-access-secret-change-me',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret-change-me',
    ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME || '15m',
    REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME || '7d'
  },
  RABBITMQ: {
    URL: process.env.RABBITMQ_URL || 'amqp://localhost'
  }
};

module.exports = config;
