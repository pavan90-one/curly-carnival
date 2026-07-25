const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        default: 'credit_card'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    transactionId: {
        type: String,
        default: () => 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
    }
}, { timestamps: true });

module.exports = paymentSchema;
