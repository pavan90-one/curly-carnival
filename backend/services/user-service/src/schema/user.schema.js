const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    authUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    firstName: String,
    lastName: String,
    phone: String,
    dob: Date,
    gender: String,
    address: String,
    city: String,
    state: String,
    country: String,
    profileImage: String
}, {
    timestamps: true
});

module.exports = userSchema;