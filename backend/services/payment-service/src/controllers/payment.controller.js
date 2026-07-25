const repository = require('../repositories/payment.repository');
const { validatePayment } = require('../schema/payment.schema');
function list(_req, res) { res.json(repository.findAll()); }
function create(req, res) { const error = validatePayment(req.body); return error ? res.status(400).json({ error }) : res.status(201).json(repository.create(req.body)); }
module.exports = { list, create };
