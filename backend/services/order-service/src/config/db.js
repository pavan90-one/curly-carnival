const mongoose = require("mongoose");
const config = require("../config/config");
const connectDB = async () => {
    try {
        await mongoose.connect(config.data_Url);
        console.log("MongoDB connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}
module.exports = connectDB;