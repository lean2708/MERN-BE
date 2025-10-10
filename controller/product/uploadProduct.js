const checkAdminPermission = require("../../helpers/permission")
const productModel = require("../../models/productModel")


async function uploadProductController(req,res) {
    try {
        console.log("Create Product")

        const sessionUserId = req.userId

        if(!checkAdminPermission(sessionUserId)){
            throw new Error("Permission denied")
        }

        const uploadProduct = new productModel(req.body)
        const saveProduct = await uploadProduct.save()

        res.status(201).json({
            message : "Product upload successfully",
            error : false,
            success : true,
            data : saveProduct
        })
    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = uploadProductController