const { connect, getChannel } = require('./rabbitmq.connection');
const { bus, EventBus } = require('./publisher');
const { consumeQueue } = require('./consumer');
const { event_list } = require('./events');
const queues = require('./queues');

module.exports = {
    connect,
    getChannel,
    bus,
    EventBus,
    consumeQueue,
    event_list,
    queues
};
