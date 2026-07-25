const Product = require('../models/product.model'); 
class ProductRepository {
    constructor() {
        this.products = [];
    }
    async create(product) {
        const prod = await Product.create(product);
        return prod;
    }
    async createMany(products) {
        const prods = await Product.insertMany(products);
        return prods;
    }
    async findAll(query) {
        const filter = query ? { name: { $regex: query, $options: 'i' } } : {};
        const products = await Product.find(filter);
        return products;
    }
    async findById(id) {
        const prod = await Product.findById(id);
        return prod;
    }
    async update(id, product) {
        const prod = await Product.findByIdAndUpdate(id, product, { new: true });
        return prod;
    }
    async delete(id) {
        const prod = await Product.findByIdAndDelete(id);
        return prod;
    }
}
module.exports = new ProductRepository();