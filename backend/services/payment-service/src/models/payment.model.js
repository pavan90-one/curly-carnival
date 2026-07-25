function createPayment({ orderId, amount, currency = 'USD' }) { return { id: `pay_${Date.now()}`, orderId, amount, currency, status: 'succeeded', createdAt: new Date().toISOString() }; }
module.exports = { createPayment };
