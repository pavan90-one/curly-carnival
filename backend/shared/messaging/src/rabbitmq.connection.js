const amqp = require('amqplib');
const config = require("./config/config")
let channel = null;
async function connect() {
    try {
        const connection = await amqp.connect(config.RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
    }
}

function getChannel() {
    return channel;
}

module.exports = { connect, getChannel, channel };

