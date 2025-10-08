const addToCartModel = require("../../models/cartProduct")


const addToCartViewProduct = async(requestAnimationFrame,res)=>{
    try {
        const currnetUser = req.userId

        const allProduct = await addToCartModel.find({
            userId : currnetUser
        }).populate("productId")

        res.json({
            data : allProduct,
            success : true,
            error : false
        })

    } catch (err) {
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = addToCartViewProduct