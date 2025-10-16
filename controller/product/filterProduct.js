const productModel = require("../../model/productModel")


const filterProductController = async (req,res)=>{
    try {
        console.log("Product filter...")

        const categoryList = req?.body?.category ||  []
        
        // 
        const product = await productModel.find({
            category : {
                "$in" : categoryList
            }
        })

        console.log("Product filter completed successfully");

        res.json({
            data : product,
            message : "product filter",
            error : false,
            success : true
        })

    } catch (err) {
        console.log("FilterProduct Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });

        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = filterProductController