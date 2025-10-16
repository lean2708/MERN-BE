const checkAdminPermission = require("../../helpers/permission")
const productModel = require("../../model/productModel")


async function uploadProductController(req,res) {
    try {
        console.log("Create Product")

        const sessionUserId = req.userId

        if(!checkAdminPermission(sessionUserId)){
            throw new Error("Permission denied")
        }

        const uploadProduct = new productModel(req.body)
        const saveProduct = await uploadProduct.save()

         console.log("Upload Product successfully — Product ID:", saveProduct._id, "uploaded by user:", sessionUserId)

        res.status(201).json({
            message : "Product upload successfully",
            error : false,
            success : true,
            data : saveProduct
        })

    } catch (err) {
        console.log("UploadProduct Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });

        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = uploadProductController