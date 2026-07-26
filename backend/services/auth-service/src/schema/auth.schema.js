const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    otp: {
        code: Number,
        expiry: Date,
        sentAt: Date,
        verified: {
            type: Boolean,
            default: false
        }
    },
    passwordReset: {
        token: String,
        expiry: Date,
        sentAt: Date,
        verified: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

module.exports = authSchema;



