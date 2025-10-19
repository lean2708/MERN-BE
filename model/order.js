const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    },
    
    orderItems: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Số lượng phải ít nhất là 1']
            },
            unitPrice: {
                type: Number,
                required: true 
            }
        }
    ],

    shippingAddress: {
        type: Schema.Types.ObjectId,
        ref: 'address',
        required: true
    },
    
    
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },

    paymentMethod: {
        type: String,
        enum: ['CASH', 'VNPAY'],
        required: [true, 'Phương thức thanh toán là bắt buộc']
    },
    
    
    orderStatus: {
        type: String,
        enum: [
            'pending',     // Chờ xác nhận
            'processing',  // Đang xử lý
            'shipped',     // Đã gửi hàng
            'delivered',   // Đã giao hàng
            'cancelled'    // Đã hủy
        ],
        default: 'pending'
    },
    
    
    orderDate: {
        type: Date,
        default: Date.now
    },
    
    paidAt: {
        type: Date
    },
    
    deliveredAt: {
        type: Date
    }
}, {
    
    timestamps: true 
});

const orderModel = mongoose.model('order', orderSchema);
module.exports = orderModel;