const orderModel = require('../model/order');
const addressModel = require('../model/address');
const vnpayService = require('../service/vnPayService');
const productModel = require('../model/productModel');


const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { shippingAddressId, paymentMethod, products } = req.body;

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
            res.status(201).json({
            data : order, 
            success : true,
            error : false,
            message: "Đặt hàng thành công!",
        });

        } else if (order.paymentMethod === 'VNPAY') {
            const paymentUrl = vnpayService.createPaymentUrl(req, order);
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

        if (!status) {
            throw new Error("Provide status order");
        }

        // Check valid status
        const allowedStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!allowedStatuses.includes(status.toUpperCase())) {
            throw new Error("Invalid order status");
        }

        const orders = await orderModel.find({ 
            user: userId, 
            orderStatus: status 
        }).sort({ createdAt: -1 });

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

        const order = await orderModel.findById(orderId)
            .populate('orderItems.product')
            .populate('shippingAddress');

        if (!order) {
            throw new Error("Order not exists");
        }
        if (order.user.toString() !== userId) {
            throw new Error("You are not authorized to view this order");
        }

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
    try { // <-- FIX 1: Thêm khối try
        const vnp_Params = req.query;
        const responseCode = vnp_Params['vnp_ResponseCode'];
        
        // <-- FIX 4 (Đề xuất): Dùng vnp_TxnRef làm mã đơn hàng
        // Đây là tham số chuẩn của VNPAY cho mã giao dịch của merchant
        const orderId = vnp_Params['vnp_TxnRef']; 

        // Nếu bạn chắc chắn bạn đã tự truyền 'orderId' vào returnUrl, thì giữ dòng dưới
        // const orderId = vnp_Params['orderId']; 

        const isVerified = vnpayService.verifyReturnUrl(vnp_Params);
        
        const frontendSuccessUrl = `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`;
        const frontendFailUrl = `${process.env.FRONTEND_URL}/payment-fail?orderId=${orderId}`;

        if (isVerified) {
            if (responseCode === '00') {
                // <-- FIX 3: Kiểm tra trạng thái đơn hàng trước khi cập nhật
                const order = await orderModel.findById(orderId);

                // Giả sử trạng thái ban đầu là 'PENDING'.
                // Chỉ cập nhật nếu đơn hàng tồn tại và đang ở trạng thái 'PENDING'.
                if (order && order.orderStatus === 'PENDING') {
                    await orderModel.findByIdAndUpdate(orderId, {
                        paidAt: new Date(),
                        orderStatus: 'PROCESSING' // Hoặc 'PAID'
                    });
                }
                // Nếu đơn hàng đã được xử lý rồi (không còn là PENDING) thì cứ redirect về success
                return res.redirect(frontendSuccessUrl);

            } else {
                // Thanh toán thất bại (lỗi từ VNPAY, ví dụ: thiếu tiền, hủy giao dịch)
                return res.redirect(frontendFailUrl);
            }
        } else {
            // <-- FIX 2: Xử lý trường hợp chữ ký không hợp lệ
            console.log("VNPAY Return URL verification failed: Signature mismatch.");
            return res.redirect(frontendFailUrl);
        }

    } catch (err) { // <-- FIX 1: Khối catch bây giờ đã hợp lệ
        // <-- FIX 5: Sửa lại nội dung log
        console.log("VNPAY Return Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        // Khi có lỗi server 500, nên trả về JSON thay vì redirect
        res.status(500).json({
            message : err.message || "Internal Server Error",
            error : true,
            success : false
        });
    }
};



module.exports = {
    createOrder,
    getMyOrdersByStatus,
    getOrderById,
    cancelOrder,
    vnpayReturn
};

