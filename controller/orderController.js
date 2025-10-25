const orderModel = require('../model/order');
const addressModel = require('../model/address');
const vnpayService = require('../service/vnPayService');
const productModel = require('../model/productModel');
const checkAdminPermission = require('../helpers/permission');


const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { shippingAddressId, paymentMethod, products } = req.body;

        console.log("Create Order request received for user:", userId, "Payment:", paymentMethod);

        if (!shippingAddressId || !paymentMethod) {
            throw Error("Provide shippingAddressId and paymentMethod");
        }
        if (!products || !Array.isArray(products) || products.length === 0) {
            throw Error("Provide products");
        }

        // Get information of products from DB
        const productIds = products.map(p => p.productId);
        const productsInDb = await productModel.find({ '_id': { $in: productIds } });

        // check all products exist
        if (productsInDb.length !== productIds.length) {
            throw Error("Một hoặc nhiều sản phẩm không được tìm thấy trong hệ thống.");
        }
        
        const productMap = new Map(productsInDb.map(p => [p._id.toString(), p]));

        // total price  orderItems to DATABASE
        let totalPrice = 0;
        const orderItems = products.map(item => {
            const productDetail = productMap.get(item.productId);
            
            const itemPrice = productDetail.sellingPrice * item.quantity;
            totalPrice += itemPrice;
            return {
                product: productDetail._id,
                quantity: item.quantity,
                unitPrice: productDetail.sellingPrice
            };
        });

        // check address
        const shippingAddress = await addressModel.findOne({ _id: shippingAddressId, user: userId });
        if (!shippingAddress) {
            throw Error("Address not found for this user.");
        }

        // create order
        const order = new orderModel({
            user: userId,
            orderItems, // Mảng sản phẩm cho DB
            shippingAddress: shippingAddressId,
            totalPrice,
            paymentMethod: paymentMethod.toUpperCase(),
        });
        await order.save();


        // Create payment URL if payment method is VNPAY
        if (order.paymentMethod === 'CASH') {
            console.log("Order (CASH) created successfully for user:", userId, "OrderId:", order._id);

            res.status(201).json({
            data : order, 
            success : true,
            error : false,
            message: "Đặt hàng thành công!",
        });

        } else if (order.paymentMethod === 'VNPAY') {
            const paymentUrl = vnpayService.createPaymentUrl(req, order);

            console.log("Order (VNPAY) created for user:", userId, "OrderId:", order._id, "Redirecting to VNPAY.");

            res.status(201).json({
            data : order, 
            success : true,
            error : false,
            message: "Đơn hàng đã được tạo. Vui lòng thanh toán.",
            paymentUrl: paymentUrl
        });}

    } catch (err) {
        console.log("Create Order Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};

const getMyOrdersByStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query; 

        console.log("Get My Orders request received for user:", userId, "Status:", status);

        if (!status) {
            throw new Error("Provide status order");
        }

        const upperStatus = status.toUpperCase();

        // Check valid status
        const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!allowedStatuses.includes(upperStatus.toUpperCase())) {
            throw new Error("Invalid order status");
        }

        const orders = await orderModel.find({ 
            user: userId, 
            orderStatus: upperStatus 
        })
        .populate('shippingAddress')
        .populate('orderItems.product', 'productName productImage')
        .sort({ createdAt: -1 });

        console.log("Fetched", orders.length, "orders with status", upperStatus, "for user:", userId);

        res.status(201).json({
            data : orders, 
            success : true,
            error : false,
            message: `Lấy đơn hàng với trạng thái '${status}' thành công`
        });

    } catch (err) {
        console.log("Create Address Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};


const getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.id;

        console.log("Get Order By Id request received for user:", userId, "OrderId:", orderId);

        const order = await orderModel.findById(orderId)
            .populate('orderItems.product')
            .populate('shippingAddress');

        if (!order) {
            throw new Error("Order not exists");
        }
        if (order.user.toString() !== userId) {
            throw new Error("You are not authorized to view this order");
        }

        console.log("Fetched order details successfully for user:", userId, "OrderId:", orderId);

        res.status(200).json({
            data : order, 
            success : true,
            error : false,
            message: "Fetch order by Id successfully!"
        });

    } catch (err) {
        console.log("Get Order By Id Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};

// API 4: Hủy đơn hàng 
const cancelOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const orderId = req.params.id;
        const order = await orderModel.findById(orderId);

        console.log("Cancel Order request received for user:", userId, "OrderId:", orderId);

        if (!order) {
            throw Error("Order not exists");
        }
        if (order.user.toString() !== userId) {
            throw Error("You are not authorized to cancel this order");
        }
        if (order.orderStatus !== 'PENDING') {
            throw Error(`Cannot cancel order in status '${order.orderStatus}'.`);
        }

        order.orderStatus = 'CANCELLED';
        await order.save();

        console.log("Order cancelled successfully for user:", userId, "OrderId:", orderId);

        res.status(200).json({
            data : order, 
            success : true,
            error : false,
            message: "Cancel order successfully!"
        });

    } catch (err) {
        console.log("Cancel order Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};


const vnpayReturn = async (req, res) => {
    try {
        const vnp_Params = req.query; 

        const responseCode = vnp_Params['vnp_ResponseCode'];
        const orderId = vnp_Params['vnp_TxnRef'];

        console.log("VNPAY Return request received. TxnRef:", orderId, "ResponseCode:", responseCode);

        // find order by Id
        const order = await orderModel.findById(orderId);
        if (!order) {
           throw new Error("Order not exists");
        }

        // Handle payment result
        if (responseCode === '00') {
            if (order.orderStatus === 'PENDING') {
                await orderModel.findByIdAndUpdate(orderId, {
                    paidAt: new Date(),
                    orderStatus: 'PROCESSING'
                });
                
                const updatedOrder = await orderModel.findById(orderId);

                console.log("VNPAY payment successful and order updated:", orderId);
                
                return res.status(200).json({
                    success: true,
                    error : false,
                    message: "Thanh toán thành công!",
                    data: updatedOrder
                });
            } else {
                console.log("VNPAY payment successful (already processed):", orderId);
                
                return res.status(200).json({
                    success: false,
                    error : true,
                    message: "Giao dịch đã được ghi nhận trước đó.",
                    data: order
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                eror : true,
                message: `Thanh toán thất bại (Mã lỗi VNPAY: ${responseCode})`,
                data: order 
            });
        }

    } catch (err) {
        console.log("VNPAY Check Return Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
};



const getAllOrdersForAdmin = async (req, res) => {
    try {
        const isAdmin = await checkAdminPermission(req.userId);
        
        if (!isAdmin) {
            throw new Error("Permission denied. Admin access only.");
        }
        
        const { status } = req.query;
        console.log(`Received Admin ${req.userId} fetching orders. Status filter: ${status}`);

        let filter = {};
        if (status) {
            const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
            const upperStatus = status.toUpperCase();
            
            if (!allowedStatuses.includes(upperStatus)) {
                throw new Error("Invalid order status provided.");
            }
            filter.orderStatus = upperStatus;
        }
        // Khong co status se lay tat ca don hang

        const orders = await orderModel.find(filter)
            .populate('user', 'name email')
            .populate('shippingAddress') 
            .populate('orderItems.product', 'productName productImage')
            .sort({ createdAt: -1 });     

        console.log(`Admin fetch successfully. Found ${orders.length} orders.`);

        res.status(200).json({
            data: orders,
            success: true,
            error: false,
            message: "Successfully fetched all orders for Admin"
        });

    } catch (err) {
        console.log("GetAllOrders (Admin) Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};




module.exports = {
    createOrder,
    getMyOrdersByStatus,
    getOrderById,
    cancelOrder,
    vnpayReturn,
    getAllOrdersForAdmin
};

