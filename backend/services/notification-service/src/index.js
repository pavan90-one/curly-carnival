const app = require('./app'); const { port } = require('./config/config');
app.listen(port, () => console.log(`notification-service listening on ${port}`));
