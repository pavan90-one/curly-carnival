const { createOrder } = require('../models/order.model');
const orders = [];
function findAll(userId) { return userId ? orders.filter(order => order.userId === userId) : orders; }
function create(data) { const order = createOrder(data); orders.push(order); return order; }
module.exports = { findAll, create };
