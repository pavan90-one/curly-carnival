const router = require('express').Router(); const controller = require('../controllers/payment.controller');
router.get('/', controller.list); router.post('/', controller.create); module.exports = router;
