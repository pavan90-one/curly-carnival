function createOrder({ userId, items }) { const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0); return { id: `ord_${Date.now()}`, userId, items, total: Number(total.toFixed(2)), status: 'pending', createdAt: new Date().toISOString() }; }
module.exports = { createOrder };
