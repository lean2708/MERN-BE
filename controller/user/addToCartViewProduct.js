const addToCartModel = require("../../model/cartProduct")
const productModel = require("../../model/productModel")


const addToCartViewProduct = async(req,res)=>{
    try {
        const currentUser = req.userId

        console.log("Fetch All Cart Item For userId:", currentUser)

        const cartProducts = await addToCartModel.find({
            userId: userId
        }).populate('productId');

        console.log("Cart details fetched successfully for user:", currentUser);

        res.json({
            data : cartProducts,
            success : true,
            error : false
        })

    } catch (err) {
        console.log("AddToCartViewProduct Controller ERROR:", {
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


async function convertCartItems(cartItems) {
    return await Promise.all(
        cartItems.map(async item => 
        {
            const  product = await productModel.findById(item.productId);
            return {
                ...item.toObject(),
                product : product || null
            };
        })
    )
}


module.exports = addToCartViewProduct