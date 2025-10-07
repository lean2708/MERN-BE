
async function getProductController(req,res) {
    try {
        const allProduct = await productModel.find().sort({createAt : -1})

        req.json({
            message : "All Product",
            success : true,
            error : false,
            data : allProduct
        })

    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getProductController