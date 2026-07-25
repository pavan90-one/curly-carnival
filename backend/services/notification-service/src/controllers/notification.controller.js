const repository = require('../repositories/notification.repository');
const { validateNotification } = require('../schema/notification.schema');

function list(_req, res) { res.json(repository.findAll()); }
function create(req, res) {
  const error = validateNotification(req.body);
  return error ? res.status(400).json({ error }) : res.status(202).json(repository.create(req.body));
}

module.exports = { list, create };
