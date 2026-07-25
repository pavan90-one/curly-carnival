const { createProduct } = require('../models/product.model');

const products = [
  { id: 'prd_aurora', name: 'Aurora Headphones', price: 129.99, category: 'Audio', inventory: 18, image: '🎧' },
  { id: 'prd_orbit', name: 'Orbit Smart Lamp', price: 74.5, category: 'Home', inventory: 12, image: '💡' },
  { id: 'prd_slate', name: 'Slate Keyboard', price: 99, category: 'Workspace', inventory: 25, image: '⌨️' },
  { id: 'prd_flux', name: 'Flux Bottle', price: 32, category: 'Lifestyle', inventory: 40, image: '🧴' }
];

function findAll(search) { return search ? products.filter(item => item.name.toLowerCase().includes(search.toLowerCase())) : products; }
function findById(id) { return products.find(item => item.id === id); }
function create(data) { const product = createProduct(data); products.push(product); return product; }
module.exports = { findAll, findById, create };
