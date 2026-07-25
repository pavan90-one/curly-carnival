function createProduct(input) {
  return { id: `prd_${Date.now()}`, ...input };
}
module.exports = { createProduct };
