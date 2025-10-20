const express = require('express')
const router = express.Router()

const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require("../controller/user/userSignIn")
const userDetailsController = require('../controller/user/userDetails')
const authToken = require('../middleware/authToken')
const userLogoutController = require('../controller/user/userLogout')
const allUser = require('../controller/user/allUser')
const updateUser = require('../controller/user/updateUser')
const uploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const getCategoryProductOne = require('../controller/product/getCategoryProductOne')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
const getProductDetails = require('../controller/product/getProductDetails')
const addToCartController = require('../controller/user/addToCartController')
const countAddToCartProduct = require('../controller/user/countAddToCartProduct')
const addToCartViewProduct = require('../controller/user/addToCartViewProduct')
const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct')
const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct')
const searchProduct = require('../controller/product/searchProduct')
const filterProductController = require('../controller/product/filterProduct')
const { forgotPassword, verifyOtp, resetPassword } = require('../controller/user/userForgotPassword')
const { createAddress, getUserAddresses, deleteAddress, updateAddress } = require('../controller/addressController')
const { createOrder, getMyOrdersByStatus, getOrderById, cancelOrder, vnpayReturn } = require('../controller/orderController')


// auth 
router.post("/signup", userSignUpController)
router.post("/signin", userSignInController)
router.get("/user-details", authToken, userDetailsController)
router.get("/userLogout", userLogoutController)
router.post("/forgot-password", forgotPassword)
router.post("/forgot-password/verify-otp", verifyOtp)
router.post("/forgot-password/reset-password", resetPassword)


// admin panel
router.get("/all-user", authToken, allUser)
router.post("/update-user", authToken, updateUser)


// product 
router.post("/upload-product", authToken, uploadProductController)
router.get("/get-product", getProductController)
router.post("/update-product", authToken, updateProductController)
router.get("/get-categoryProduct", getCategoryProductOne)
router.post("/category-product", getCategoryWiseProduct)
router.post("/product-details", getProductDetails)
router.get("/search", searchProduct)
router.post("/filter-product", filterProductController)



// user add to cart
router.post("/addtoCart", authToken, addToCartController)
router.get("/countAddToCartProduct", authToken, countAddToCartProduct)
router.get("/view-cart-product", authToken, addToCartViewProduct)
router.post("/update-cart-product", authToken, updateAddToCartProduct)
router.post("/delete-cart-product", authToken, deleteAddToCartProduct)


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


module.exports = router
