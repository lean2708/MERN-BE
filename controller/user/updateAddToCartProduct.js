const addToCartModel = require("../../model/cartProduct")


const updateAddToCartProduct = async (req,res)=>{
    try {
        const currentUserId = req.userId
        const addToCartProductId = req?.body?._id

        console.log("Update CartItem request for cartId:", addToCartProductId)

        const qty = req.body.quantity

        const updateProduct = await addToCartModel.updateOne(
            {_id : addToCartProductId}, 
            {...(qty && {quantity : qty})}
        )

        console.log("Update Cart Item successfully for cartId:", addToCartProductId)

        res.json({
            message  : "Product Updated",
            data  : updateProduct,
            error : false,
            success : true
        })

    } catch (err) {
        console.log("UpdateAddToCartProduct Controller ERROR:", {
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

module.exports = updateAddToCartProduct