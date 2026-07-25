const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    userPass: {
        type: String,
        required: true
    },
    userAge: {
        type: Number,
        required: false
    },
    userDob: {
        type: Date,
        required: false
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updateDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = userSchema;