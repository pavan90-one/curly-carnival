function validatePayment(input) { return input && input.orderId && typeof input.amount === 'number' && input.amount > 0 ? null : 'orderId and a positive amount are required'; }
module.exports = { validatePayment };
