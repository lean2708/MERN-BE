const { request } = require("express")
const productModel = require("../../models/productModel")

const getCategoryWiseProduct = async (req, res) => {
    try {
        const {category} = request.body || req?.query
        const product = await  productModel.find({category})

        res.json({
            data : product,
            message : "Product",
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getCategoryWiseProduct