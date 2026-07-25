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
    async reduceStock(items) {
        for (const item of items) {
            const pId = item.productId || item.id;
            const qty = Number(item.quantity || 1);
            const prod = await Product.findById(pId);
            if (!prod) {
                throw new Error(`Product not found: ${pId}`);
            }
            if (prod.stock < qty) {
                throw new Error(`Insufficient stock for product '${prod.name}'. Required: ${qty}, Available: ${prod.stock}`);
            }
            prod.stock -= qty;
            await prod.save();
        }
        return { success: true, message: 'Stock reduced successfully' };
    }
    async restoreStock(items) {
        for (const item of items) {
            const pId = item.productId || item.id;
            const qty = Number(item.quantity || 1);
            const prod = await Product.findById(pId);
            if (prod) {
                prod.stock += qty;
                await prod.save();
            }
        }
        return { success: true, message: 'Stock restored successfully' };
    }
}
module.exports = new ProductRepository();