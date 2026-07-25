const mongoose = require("mongoose");
const dotenv = require("dotenv").env;
const config = {
       port: Number(process.env.PORT) || 4002,
       data_Url :process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/smart-commerce-products"
}
module.exports = config;
