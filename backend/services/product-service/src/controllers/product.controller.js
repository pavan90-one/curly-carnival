const repository = require('../repositories/product.repository');
const { validateProduct } = require('../schema/product.schema');

function list(req, res) { res.json(repository.findAll(req.query.q)); }
function getById(req, res) { const product = repository.findById(req.params.id); return product ? res.json(product) : res.status(404).json({ error: 'Product not found' }); }
function create(req, res) { const error = validateProduct(req.body); return error ? res.status(400).json({ error }) : res.status(201).json(repository.create(req.body)); }
module.exports = { list, getById, create };
