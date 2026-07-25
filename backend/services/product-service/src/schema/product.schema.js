function validateProduct(input) {
  if (!input || !input.name || typeof input.name !== 'string') return 'name is required';
  if (typeof input.price !== 'number' || input.price < 0) return 'price must be a non-negative number';
  return null;
}
module.exports = { validateProduct };
