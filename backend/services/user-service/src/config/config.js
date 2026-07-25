const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const url = process.env.DATABASE_URL || process.env.MONGO_URI;
if (!url) {
  throw new Error('Missing DATABASE_URL (or MONGO_URI). Set it in src/.env or the environment.');
}

module.exports = { url };
