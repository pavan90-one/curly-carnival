function createLogger(serviceName = 'service') {
    return {
        info: (message, meta = {}) => {
            const timestamp = new Date().toISOString();
            console.log(JSON.stringify({ timestamp, level: 'INFO', service: serviceName, message, ...meta }));
        },
        error: (message, meta = {}) => {
            const timestamp = new Date().toISOString();
            console.error(JSON.stringify({ timestamp, level: 'ERROR', service: serviceName, message, ...meta }));
        },
        warn: (message, meta = {}) => {
            const timestamp = new Date().toISOString();
            console.warn(JSON.stringify({ timestamp, level: 'WARN', service: serviceName, message, ...meta }));
        },
        debug: (message, meta = {}) => {
            const timestamp = new Date().toISOString();
            console.debug(JSON.stringify({ timestamp, level: 'DEBUG', service: serviceName, message, ...meta }));
        }
    };
}

module.exports = {
    createLogger,
    logger: createLogger('backend')
};
