const app = require('./app');
const config = require('./src/config/config');
const { connect } = require('./src/rabbitmq.connection');


app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
    connect()
});