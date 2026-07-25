const app = require('./app');
const { port } = require('./config/config');
app.listen(port, () => console.log(`order-service listening on ${port}`));
