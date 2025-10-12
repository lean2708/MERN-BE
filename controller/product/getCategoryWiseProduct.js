const productModel = require("../../models/productModel")

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
        console.log("GetCategoryWiseProduct Controller ERROR:", err.message)

        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getCategoryWiseProduct