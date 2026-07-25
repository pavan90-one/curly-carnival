const router = require('express').Router();
const paymentController = require('../controllers/payment.controller');

router.get('/', paymentController.getAllPayments.bind(paymentController));
router.post('/', paymentController.createPayment.bind(paymentController));
router.post('/process', paymentController.processPayment.bind(paymentController));
router.get('/order/:orderId', paymentController.getPaymentByOrderId.bind(paymentController));

module.exports = router;
