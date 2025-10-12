const checkAdminPermission = require("../../helpers/permission")
const productModel = require("../../models/productModel")


async function updateProductController(req,res) {
    try {
        console.log("Update Product")

        // check authorization
        if(!checkAdminPermission(req.userId)){
            throw new Error("Permission denied")
        }

        // gan req.body cho cac bien
        const {_id, ...resBody} = req.body

        const updateProduct = await productModel.findByIdAndUpdate(_id, resBody,{new : true})

        console.log("Update Product successfully — Product ID:", _id, ", updated by user:", req.userId)
        
        res.json({
            message : "Product update successfully",
            data : updateProduct,
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

module.exports = updateProductController