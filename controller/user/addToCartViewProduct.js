const addToCartModel = require("../../models/cartProduct")
const productModel = require("../../models/productModel")


const addToCartViewProduct = async(req,res)=>{
    try {
        const currentUser = req.userId

        console.log("Fetch All Cart Item For userId:", currentUser)

        // thay the productId bang du lieu productModel
        const allProduct = await addToCartModel.find({
            userId : currentUser
        });

        const detailItems = await convertCartItems(allProduct);

        console.log("Cart details fetched successfully for user:", currentUser);

        res.json({
            data : detailItems,
            success : true,
            error : false
        })

    } catch (err) {
        console.log("AddToCartViewProduct Controller ERROR:", err.message)
        
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