const { createPayment } = require('../models/payment.model');
const payments = [];
function findAll() { return payments; }
function create(data) { const payment = createPayment(data); payments.push(payment); return payment; }
module.exports = { findAll, create };
