require("dotenv").config();
const config = {
    data_Url: process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/smart-commerce-payments",
    port: Number(process.env.PORT) || 4004
};
module.exports = config;
