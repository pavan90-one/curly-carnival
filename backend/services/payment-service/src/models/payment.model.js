const mongoose = require('mongoose');
const paymentSchema = require('../schema/payment.schema');

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
