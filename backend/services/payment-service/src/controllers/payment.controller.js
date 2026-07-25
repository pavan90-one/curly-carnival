const PaymentRepository = require('../repositories/payment.repository');

class PaymentController {
    constructor(repository = new PaymentRepository()) {
        this.repository = repository;
    }

    async createPayment(req, res, next) {
        try {
            const { orderId, amount, paymentMethod } = req.body;
            if (!orderId || !amount) {
                return res.status(400).json({ error: 'orderId and amount are required' });
            }
            const payment = await this.repository.createPayment({
                orderId,
                amount: Number(amount),
                paymentMethod: paymentMethod || 'credit_card',
                status: 'completed'
            });
            res.status(201).json(payment);
        } catch (error) {
            next(error);
        }
    }

    async processPayment(req, res, next) {
        try {
            const { orderId, amount, paymentMethod } = req.body;
            if (!orderId || !amount) {
                return res.status(400).json({ error: 'orderId and amount are required' });
            }
            // Simulate payment processing (success if amount > 0)
            const isSuccess = Number(amount) > 0;
            const payment = await this.repository.createPayment({
                orderId,
                amount: Number(amount),
                paymentMethod: paymentMethod || 'credit_card',
                status: isSuccess ? 'completed' : 'failed'
            });
            
            if (!isSuccess) {
                return res.status(400).json({ success: false, message: 'Payment processing failed', payment });
            }

            res.status(200).json({ success: true, message: 'Payment processed successfully', payment });
        } catch (error) {
            next(error);
        }
    }

    async getAllPayments(req, res, next) {
        try {
            const payments = await this.repository.findAll();
            res.status(200).json(payments);
        } catch (error) {
            next(error);
        }
    }

    async getPaymentByOrderId(req, res, next) {
        try {
            const payments = await this.repository.findByOrderId(req.params.orderId);
            res.status(200).json(payments);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
