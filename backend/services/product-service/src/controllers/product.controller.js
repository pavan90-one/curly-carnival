const defaultProductService = require('../services/product.service');

class ProductController {
    constructor(productService = defaultProductService) {
        this.productService = productService;
    }

    async list(req, res, next) {
        try {
            const products = await this.productService.findAll(req.query.q);
            res.json(products);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const product = await this.productService.findById(req.params.id);
            return product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const product = await this.productService.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const product = await this.productService.update(req.params.id, req.body);
            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const product = await this.productService.delete(req.params.id);
            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    async seed(req, res, next) {
        try {
            const count = parseInt(req.params.count || req.query.count, 10) || 10;
            const seededProducts = await this.productService.seed(count);
            res.status(201).json({ message: `Successfully seeded ${seededProducts.length} products`, products: seededProducts });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController;   