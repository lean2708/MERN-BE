const addToCartModel = require("../../models/cartProduct")

const countAddToCartProduct = async (req,res) =>{
    try {
        const userId = req.userId

         console.log("Counting cart items request for user:", userId)

        const count = await addToCartModel.countDocuments({
            userId : userId
        })

        console.log("Counting cart items successfully for user :", userId)

        res.json({
            data : {
                count : count
            },
            message : "Ok",
            error : false,
            success : true
        })

    } catch (err) {
         console.log("CountAddToCartProduct Controller ERROR:", err.message)
         
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = countAddToCartProduct