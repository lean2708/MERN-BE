const addToCartModel = require("../../model/cartProduct")

const deleteAddToCartProduct = async(req,res) => {
    try {
        const currentUserId = req.userId
        const addToCartProductId = req.body._id

        console.log("Delete Cart Item request for cartId:", addToCartProductId)

        if (!cartItemId) {
            throw new Error("Provide cartItemId");
        }
    
        const deleteProduct  = await addToCartModel.deleteOne({_id : addToCartProductId})

        console.log("Delete Cart Item successfully for cartId:", addToCartProductId)

        res.json({
            message : "Product Delete Form Cart",
            error  :  false,
            success : true,
            data : deleteProduct
        })

    } catch (err) {
        console.log("DeleteAddToCartProduct Controller ERROR:", {
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

module.exports = deleteAddToCartProduct