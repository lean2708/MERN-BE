const productModel = require("../../model/productModel")

async function getProductController(req,res) {
    try {
        console.log("Get All Product...")

        const allProduct = await productModel.find().sort({createAt : -1})

        console.log("Get All Product completed successfully.")

        res.json({
            message : "All Product",
            success : true,
            error : false,
            data : allProduct
        })

    } catch (err) {
         console.log("GetProduct Controller ERROR:", {
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

module.exports = getProductController