const app = require('./app');
const { port } = require('./config/config');
app.listen(port, () => console.log(`payment-service listening on ${port}`));
