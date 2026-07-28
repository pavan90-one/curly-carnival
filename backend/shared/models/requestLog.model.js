const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        default: null,
        index: true
    },
    service: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true
    },
    request: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    result: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        default: 'SUCCESS'
    },
    durationMs: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false
});

module.exports = mongoose.models.RequestLog || mongoose.model('RequestLog', requestLogSchema, 'request_logs');
