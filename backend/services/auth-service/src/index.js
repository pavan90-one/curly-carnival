const app = require('./app');
const { port } = require('./config/config');
app.listen(port, () => console.log(`auth-service listening on ${port}`));
