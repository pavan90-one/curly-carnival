const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/db');

connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(config.port, () => console.log(`payment-service listening on port: http://localhost:${config.port}`));
}).catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
});
