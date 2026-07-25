const productSchema = require('../schema/product.schema');
const mongoose = require('mongoose');
const Product = mongoose.model('Product', productSchema);
module.exports = Product;
