const router = require('express').Router();
const orderController = require('../controllers/order.controller');
const order = new orderController();
router.post('/',order.createOrder.bind(order));
router.get('/', order.getAllOrders.bind(order));
router.get('/:orderId', order.getOrderById.bind(order));
router.put('/:orderId', order.updateOrder.bind(order));
router.delete('/:orderId', order.deleteOrder.bind(order));
module.exports = router;
