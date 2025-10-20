const mongoose = require('mongoose')

const addToCart = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', 
        required: true
    },
    quantity : Number,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    }
},{
    timestamps : true
})

const addToCartModel = mongoose.model("addToCart", addToCart)

module.exports = addToCartModel