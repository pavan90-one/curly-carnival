const app = require('./app');
const { port } = require('./config/config');
const connectDB = require('./config/db');
connectDB()
    .then(() => {
        app.listen(port, () => console.log(`auth-service listening on ${port}`));
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });