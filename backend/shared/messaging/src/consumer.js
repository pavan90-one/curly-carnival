const { getChannel } = require('./rabbitmq.connection');

async function consumeQueue(queue, onMessage) {
    const channel = getChannel();
    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized. Ensure connect() has succeeded before consuming.');
    }

    await channel.assertQueue(queue, { durable: true });
    console.log(`[*] Subscribed to queue: ${queue}`);

    await channel.consume(queue, async (msg) => {
        if (msg !== null) {
            try {
                const content = JSON.parse(msg.content.toString());
                await onMessage(content, msg);
                channel.ack(msg);
            } catch (error) {
                console.error(`Error processing message from queue ${queue}:`, error);
                channel.nack(msg, false, false); // Reject message on failure
            }
        }
    });
}

module.exports = { consumeQueue };
