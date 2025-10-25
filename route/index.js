const express = require('express')
const router = express.Router()

const authToken = require('../middleware/authToken')
const { createAddress, getUserAddresses, deleteAddress, updateAddress } = require('../controller/addressController')
const { createOrder, getMyOrdersByStatus, getOrderById, cancelOrder, vnpayReturn, getAllOrdersForAdmin } = require('../controller/orderController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const authController = require('../controller/authController')
const userController = require('../controller/userController')
const multerUpload = require('../middleware/multerUpload');
const fileController = require('../controller/fileController')


// auth 
router.post("/signup", authController.signUp)
router.post("/signin", authController.signIn)
router.get("/userLogout", authController.logout)
router.post("/forgot-password", authController.forgotPassword)
router.post("/forgot-password/verify-otp", authController.verifyOtp)
router.post("/forgot-password/reset-password", authController.resetPassword)

// user details
router.get("/user-details", authToken, userController.getUserDetails)
router.post("/change-password", authToken, userController.changeMyPassword)
router.post("/upload-avatar", authToken, multerUpload, userController.uploadAvatar)
// admin panel
router.get("/all-user", authToken, userController.getAllUsers)
router.post("/update-user", authToken, userController.updateUser)


// product 
router.post("/upload-product", authToken, productController.uploadProduct)
router.get("/get-product", productController.getAllProducts)
router.post("/update-product", authToken, productController.updateProduct)
router.get("/get-categoryProduct", productController.getOneProductPerCategory)
router.post("/category-product", productController.getCategoryWiseProduct)
router.post("/product-details", productController.getProductDetails)
router.get("/search", productController.searchProduct)
router.post("/filter-product", productController.filterProduct)



// user add to cart
router.post("/addtoCart", authToken, cartController.addItemToCart)
router.get("/countAddToCartProduct", authToken, cartController.getCartItemCount)
router.get("/view-cart-product", authToken, cartController.getFullUserCart)
router.post("/update-cart-product", authToken, cartController.updateCartItemQuantity)
router.post("/delete-cart-product", authToken, cartController.deleteCartItem)


// address 
router.post('/address', authToken, createAddress);
router.get('/address', authToken, getUserAddresses);
router.put('/address/:id', authToken, updateAddress);
router.delete('/address/:id', authToken, deleteAddress);


// Order
router.post('/order', authToken, createOrder);
router.get('/order/by-status', authToken, getMyOrdersByStatus);
router.get('/order/:id', authToken, getOrderById);
router.patch('/order/:id/cancel', authToken, cancelOrder);
router.get('/order/vnpay_return', vnpayReturn);
router.get("/all-orders", authToken, getAllOrdersForAdmin);


// File upload
router.post("/upload-images", authToken, multerUpload, fileController.uploadImages);


module.exports = router
