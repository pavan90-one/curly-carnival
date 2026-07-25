const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    items:[{
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"product",
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                default:1
            },
            price:{
                type:Number,
                required:true,
                default:0
            }
        }
    ],
    totalAmount:{
        type:Number,
        required:true,
        default:0
    },
    shippingAddress:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:"pending"
    },
    paymentStatus:{
        type:String,
        required:true,
        default:"pending"
    }
},{timestamps:true})

module.exports =  orderSchema;