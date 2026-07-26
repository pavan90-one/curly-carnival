const dotenv = require("dotenv");
dotenv.config();
const nodemailerConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
}
module.exports = { port: Number(process.env.PORT) || 4005,nodemailerConfig };
