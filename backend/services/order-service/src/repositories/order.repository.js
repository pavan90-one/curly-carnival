const ordersModel = require("../models/order.model");

class orderRepository{
   constructor(ordersModel){
      this.model = ordersModel;
   }
   async createOrder(order){
      try {
         const createdOrder = await this.model.create(order);
         return createdOrder;
      } catch (error) {
         throw error;
      }
   }
   async getAllOrders(){
    try  {
    const orders = await this.model.find();
      return orders;
    }catch (error) {
      throw error;
    }
   }
   async getOrderById(orderId){
    try {
      const order = await this.model.findById(orderId);
      return order;
    }catch (error) {
      throw error;
    }
   }
   async updateOrder(orderId,order){
    try {
      const updatedOrder = await this.model.findByIdAndUpdate(orderId,order,{new:true});
      return updatedOrder;
    }catch (error) {
      throw error;
    }
   }
   async deleteOrder(orderId){
      try {
         const deletedOrder = await this.model.findByIdAndDelete(orderId);
         return deletedOrder;
      } catch (error) {
         throw error;
      }
   }
}
module.exports = orderRepository;
