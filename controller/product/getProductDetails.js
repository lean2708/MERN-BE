const productModel = require("../../model/productModel")


const getProductDetails = async (req,res) => {
    try {
        const { productId } = req.body

        console.log("Fetch Product Details By ProductId:", productId)

        const product = await productModel.findById(productId)

         console.log("Fetch Product Details completed successfully for ID:", productId)

        res.json({
            data : product,
            message : "Ok",
            success : true,
            error : false
        })

    } catch (err) {
        console.log("GetProductDetails Controller ERROR:", {
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

module.exports = getProductDetails