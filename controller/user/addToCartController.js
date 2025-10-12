const addToCartModel = require("../../models/cartProduct")


const addToCartController = async (req,res) =>{
    try {
        const {productId} = req?.body
        const currentUser = req.userId

        console.log("User ", currentUser, "added product ", productId, "to the cart")

        const isProductAvailable = await addToCartModel.findOne({
            productId: productId,
            userId: currentUser
        })


        if(isProductAvailable){
            return  res.json({
                message : "Already exits in Add to cart",
                success : true,
                error : false
            })
        }

        const payload = {
            productId : productId,
            quantity : 1,
            userId : currentUser
        }

        const newAddToCart = new addToCartModel(payload)

        const saveProduct = await newAddToCart.save()

        console.log("Product ", productId, " added successfully to user ", currentUser, " cart");

        return res.json({
            data : saveProduct,
            message : "Product Added In Cart",
            success : true,
            error : false
        });


    } catch (err) {
        console.log("AddToCartController ERROR:", err.message)
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}


module.exports = addToCartController