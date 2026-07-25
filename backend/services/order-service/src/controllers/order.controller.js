const repository = require('../repositories/order.repository');
const { validateOrder } = require('../schema/order.schema');
function list(req, res) { res.json(repository.findAll(req.query.userId)); }
function create(req, res) { const error = validateOrder(req.body); return error ? res.status(400).json({ error }) : res.status(201).json(repository.create(req.body)); }
module.exports = { list, create };
