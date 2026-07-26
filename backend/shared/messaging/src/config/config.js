const dotenv = require  ('dotenv')
dotenv.config();
const config = {
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
    PORT: process.env.PORT || 4007
}
module.exports = config