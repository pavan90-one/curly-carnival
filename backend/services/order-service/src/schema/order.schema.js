function validateOrder(input) { return input && input.userId && Array.isArray(input.items) && input.items.length ? null : 'userId and at least one item are required'; }
module.exports = { validateOrder };
