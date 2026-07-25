const mongoose = require("mongoose");
const orderSchema = require("../schema/order.schema");
const Orders = new mongoose.model("Order",orderSchema);
module.exports = Orders;
