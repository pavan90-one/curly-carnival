const Payment = require('../models/payment.model');

class PaymentRepository {
    async createPayment(data) {
        return await Payment.create(data);
    }

    async findAll() {
        return await Payment.find();
    }

    async findByOrderId(orderId) {
        return await Payment.find({ orderId });
    }

    async findById(id) {
        return await Payment.findById(id);
    }
}

module.exports = PaymentRepository;
