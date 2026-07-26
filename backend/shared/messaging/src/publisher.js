const { event_list } = require('./events');
const { getChannel } = require('./rabbitmq.connection');

class EventBus {
    async publish(exchange = '', routingKey, data) {
        const channel = getChannel();
        if (!channel) {
            throw new Error('RabbitMQ channel is not initialized. Ensure connect() has succeeded before publishing.');
        }

        const payload = Buffer.from(JSON.stringify(data));
        return channel.publish(exchange, routingKey, payload, { persistent: true });
    }

    async sendToQueue(queue, data) {
        const channel = getChannel();
        if (!channel) {
            throw new Error('RabbitMQ channel is not initialized. Ensure connect() has succeeded before sending.');
        }

        await channel.assertQueue(queue, { durable: true });
        const payload = Buffer.from(JSON.stringify(data));
        return channel.sendToQueue(queue, payload, { persistent: true });
    }
}

const bus = new EventBus();
module.exports = { bus, EventBus };