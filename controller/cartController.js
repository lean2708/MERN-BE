const addToCartModel = require("../model/cartProduct");
const productModel = require("../model/productModel");



const cartController = {

    
    // Create Cart
    addItemToCart: async (req, res) => {
        try {
            const { productId } = req?.body;
            const currentUser = req.userId;

            console.log("User ", currentUser, "added product ", productId, "to the cart");

            if (!productId) {
                throw new Error("Provide productId");
            }

            const product = await productModel.findById(productId);
            if (!product) {
                throw new Error("Product not found");
            }

            // Check exits in cart
            const isProductAvailable = await addToCartModel.findOne({
                productId: productId,
                userId: currentUser
            });

            if (isProductAvailable) {
                return res.json({
                    message: "Already exits in Add to cart",
                    success: true,
                    error: false
                });
            }

            const payload = {
                productId: productId,
                quantity: 1,
                userId: currentUser
            };

            const newAddToCart = new addToCartModel(payload);
            const saveProduct = await newAddToCart.save();

            console.log("Product ", productId, " added successfully to user ", currentUser, " cart");

            return res.json({
                data: saveProduct,
                message: "Product Added In Cart",
                success: true,
                error: false
            });

        } catch (err) {
            console.log("AddToCartController ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Fetch Full User Cart (View Cart Products)
    getFullUserCart: async (req, res) => {
        try {
            const currentUser = req.userId;
            console.log("Fetch All Cart Item For userId:", currentUser);

            const cartProducts = await addToCartModel.find({
                userId: currentUser
            }).populate('productId');

            console.log("Cart details fetched successfully for user:", currentUser);

            res.json({
                data: cartProducts,
                success: true,
                error: false
            });

        } catch (err) {
            console.log("AddToCartViewProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Count Cart Items
    getCartItemCount: async (req, res) => {
        try {
            const userId = req.userId;
            console.log("Counting cart items request for user:", userId);

            const count = await addToCartModel.countDocuments({
                userId: userId
            });

            console.log("Counting cart items successfully for user :", userId);

            res.json({
                data: {
                    count: count
                },
                message: "Ok",
                error: false,
                success: true
            });

        } catch (err) {
            console.log("CountAddToCartProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    
    // Delete Cart Item
    deleteCartItem: async (req, res) => {
        try {
            // const currentUserId = req.userId; // Bo qua
            const addToCartProductId = req.body._id;

            console.log("Delete Cart Item request for cartId:", addToCartProductId);
            
            if (!addToCartProductId) {
                throw new Error("Provide _id (cart item id)");
            }

            const deleteProduct = await addToCartModel.deleteOne({ _id: addToCartProductId });

            console.log("Delete Cart Item successfully for cartId:", addToCartProductId);

            res.json({
                message: "Product Delete From Cart",
                error: false,
                success: true,
                data: deleteProduct
            });

        } catch (err) {
            console.log("DeleteAddToCartProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    // Update Cart Item Quantity
    updateCartItemQuantity: async (req, res) => {
        try {
            // const currentUserId = req.userId; 
            const addToCartProductId = req?.body?._id;
            const qty = req.body.quantity;

            console.log("Update CartItem request for cartId:", addToCartProductId);

            if (!addToCartProductId) {
                throw new Error("Provide _id (cart item id)");
            }
            if (!qty && qty !== 0) { // Cho phép cập nhật số lượng = 0
                throw new Error("Provide quantity");
            }

            const updateProduct = await addToCartModel.updateOne(
                { _id: addToCartProductId },
                { $set: { quantity: qty } } 
            );

            console.log("Update Cart Item successfully for cartId:", addToCartProductId);

            res.json({
                message: "Product Updated",
                data: updateProduct,
                error: false,
                success: true
            });

        } catch (err) {
            console.log("UpdateAddToCartProduct Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    }
};



module.exports = cartController;