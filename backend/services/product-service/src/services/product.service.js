const productRepository = require('../repositories/product.repository');

class ProductService {
    constructor(repository = productRepository) {
        this.repository = repository;
    }

    async findAll(query) {
        return await this.repository.findAll(query);
    }

    async findById(id) {
        return await this.repository.findById(id);
    }

    async create(data) {
        return await this.repository.create(data);
    }

    async update(id, data) {
        return await this.repository.update(id, data);
    }

    async delete(id) {
        return await this.repository.delete(id);
    }

    async reduceStock(items) {
        return await this.repository.reduceStock(items);
    }

    async restoreStock(items) {
        return await this.repository.restoreStock(items);
    }

    async seed(count = 10) {
        const sampleProducts = [
            {
                name: "Wireless Noise-Canceling Headphones",
                price: 299.99,
                stock: 50,
                description: "Premium over-ear headphones with active noise cancellation and 30-hour battery life.",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                category: "Electronics",
                rating: 4.8,
                numReviews: 124,
                isFeaturedProduct: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Ergonomic Mechanical Keyboard",
                price: 129.99,
                stock: 35,
                description: "RGB tactile mechanical keyboard with custom switches and wrist rest.",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
                category: "Electronics",
                rating: 4.6,
                numReviews: 89,
                isFeaturedProduct: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Ultra-Wide Curved Gaming Monitor",
                price: 499.99,
                stock: 20,
                description: "34-inch WQHD 144Hz curved display for immersive gaming and productivity.",
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
                category: "Electronics",
                rating: 4.9,
                numReviews: 210,
                isFeaturedProduct: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Smart Fitness Watch",
                price: 199.99,
                stock: 60,
                description: "Water-resistant smartwatch with heart rate monitoring, GPS, and sleep tracking.",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
                category: "Wearables",
                rating: 4.5,
                numReviews: 95,
                isFeaturedProduct: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Premium Espresso Coffee Machine",
                price: 349.99,
                stock: 15,
                description: "15-bar Italian pump espresso maker with milk frother wand.",
                image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f",
                category: "Home Appliances",
                rating: 4.7,
                numReviews: 67,
                isFeaturedProduct: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Professional DSLR Camera",
                price: 899.99,
                stock: 10,
                description: "24.1 MP digital SLR camera with 18-55mm lens and 4K video recording.",
                image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
                category: "Electronics",
                rating: 4.8,
                numReviews: 142,
                isFeaturedProduct: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Minimalist Leather Backpack",
                price: 89.99,
                stock: 40,
                description: "Genuine leather 15-inch laptop backpack for daily commute and travel.",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
                category: "Accessories",
                rating: 4.4,
                numReviews: 53,
                isFeaturedProduct: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Stainless Steel Insulated Water Bottle",
                price: 24.99,
                stock: 100,
                description: "32oz vacuum insulated bottle keeping drinks cold for 24h or hot for 12h.",
                image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8",
                category: "Lifestyle",
                rating: 4.6,
                numReviews: 310,
                isFeaturedProduct: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "High-Speed Portable SSD 1TB",
                price: 109.99,
                stock: 75,
                description: "NVMe solid state drive with up to 1050MB/s read/write transfer speeds.",
                image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b",
                category: "Electronics",
                rating: 4.9,
                numReviews: 188,
                isFeaturedProduct: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: "Ergonomic Mesh Office Chair",
                price: 249.99,
                stock: 25,
                description: "Breathable mesh desk chair with adjustable lumbar support and 3D armrests.",
                image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0",
                category: "Furniture",
                rating: 4.7,
                numReviews: 78,
                isFeaturedProduct: false,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        const selected = sampleProducts.slice(0, count);
        return await this.repository.createMany(selected);
    }
}

module.exports = new ProductService();
