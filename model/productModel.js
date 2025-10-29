const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    productName : String, 
    brandName : String,
    category : String,
    productImage : [],
    description : String,
    price : Number,
    sellingPrice : Number,
    stock : {
        type: Number,
        required: true,
        default: 0,
        min: 0 
    }
    
},{
    timestamps : true
})

const productModel = mongoose.model("product", productSchema)

module.exports = productModel