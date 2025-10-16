const productModel = require("../../model/productModel")

const getCategoryWiseProduct = async (req, res) => {
    try {
        const {category} = req?.body || req?.query

        console.log("Fetch products by category:", category);

        const product = await  productModel.find({category})

        console.log("getCategoryWiseProduct request completed successfully");

        res.json({
            data : product,
            message : "Product",
            success : true,
            error : false
        })

    } catch (err) {
        console.log("GetCategoryWiseProduct Controller ERROR:", {
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

module.exports = getCategoryWiseProduct