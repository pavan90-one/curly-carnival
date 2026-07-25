const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
    description: String,
    image: String,
    category: String,
    rating: Number,
    numReviews: Number,
    isFeaturedProduct: Boolean,
    createdAt: Date,
    updatedAt: Date
});

module.exports =  productSchema;
