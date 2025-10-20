const crypto = require('crypto');
const qs = require('qs');
const { format } = require('date-fns');

// Sort object 
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Create URL VNPAY
const createPaymentUrl = (req, order) => {
    const tmnCode = process.env.VNP_TMNCODE;
    const secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURNURL;

    // Lấy IP của client
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const createDate = format(new Date(), 'yyyyMMddHHmmss');
    const orderId = order._id.toString(); 

    const amount = order.totalPrice * 100; 
    const orderInfo = `Thanh toan don hang: ${orderId}`;
    
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Amount'] = amount;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_TxnRef'] = orderId;

    // Sắp xếp các tham số và tạo chuỗi query
    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });

    // Create secure hash
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    vnp_Params['vnp_SecureHash'] = signed;

    // Create URL final
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });
    return vnpUrl;
};

module.exports = {
    createPaymentUrl
};

