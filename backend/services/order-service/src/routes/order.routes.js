const router = require('express').Router();
const orderController = require('../controllers/order.controller');

router.post('/', orderController.createOrder.bind(orderController));
router.get('/', orderController.getAllOrders.bind(orderController));
router.get('/:orderId', orderController.getOrderById.bind(orderController));
router.put('/:orderId', orderController.updateOrder.bind(orderController));
router.delete('/:orderId', orderController.deleteOrder.bind(orderController));

module.exports = router;
