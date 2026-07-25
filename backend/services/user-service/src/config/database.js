const mongoose = require('mongoose');
const dbConfig = require('./config');
const connectDB = async () => {
    try {
        await mongoose.connect(dbConfig.url, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};

module.exports = connectDB; 
