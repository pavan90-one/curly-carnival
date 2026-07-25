const router = require('express').Router();
const controller = require('../controllers/order.controller');
router.get('/', controller.list);
router.post('/', controller.create);
module.exports = router;
