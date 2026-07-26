const repository = require('../repositories/order.repository');
const { addOrderJob } = require('../queue/order.queue');
const { bus, event_list, queues } = require('../../../../shared/messaging/src/index');

class orderController{
    constructor(repository){
        this.repository = repository;
    }
    async createOrder(req,res,next){
        try {   
            const createdOrder = await this.repository.createOrder(req.body);
            await addOrderJob({
                orderId: createdOrder._id.toString(),
                userId: createdOrder.userId ? createdOrder.userId.toString() : null,
                items: createdOrder.items,
                totalAmount: createdOrder.totalAmount,
                shippingAddress: createdOrder.shippingAddress
            });

            // Publish ORDER_CREATED event to RabbitMQ
            try {
                const orderPayload = {
                    event: event_list.ORDER_CREATED,
                    orderId: createdOrder._id.toString(),
                    userId: createdOrder.userId ? createdOrder.userId.toString() : null,
                    items: createdOrder.items,
                    totalAmount: createdOrder.totalAmount,
                    timestamp: new Date().toISOString()
                };
                await bus.sendToQueue(queues.PAYMENT_QUEUE, orderPayload);
                await bus.sendToQueue(queues.NOTIFICATION_QUEUE, orderPayload);
            } catch (mqErr) {
                console.error('Failed to publish ORDER_CREATED event:', mqErr.message);
            }

            res.status(201).json(createdOrder);
        } catch (error) {
            next(error);
        }
    }
    async getAllOrders(req,res,next){
        try {
            const orders = await this.repository.getAllOrders();
            res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    }
    async getOrderById(req,res,next){
        try {
            const order = await this.repository.getOrderById(req.params.orderId);
            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    }
    async updateOrder(req,res,next){
        try {
            const updatedOrder = await this.repository.updateOrder(req.params.orderId,req.body);
            res.status(200).json(updatedOrder);
        } catch (error) {
            next(error);
        }
    }
    async deleteOrder(req,res,next){
        try {
            const deletedOrder = await this.repository.deleteOrder(req.params.orderId);
            res.status(200).json(deletedOrder);
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new orderController(new repository()); 