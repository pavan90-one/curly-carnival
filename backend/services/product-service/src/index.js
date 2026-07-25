const app = require('./app');
const { port } = require('./config/config');

app.listen(port, () => console.log(`product-service listening on ${port}`));
