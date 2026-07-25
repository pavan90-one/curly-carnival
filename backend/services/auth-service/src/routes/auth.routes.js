const router = require('express').Router();
const controller = require('../controllers/auth.controller');
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/refresh-token', controller.refresh);
router.post('/logout', controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
module.exports = router;
