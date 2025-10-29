const cron = require('node-cron');
const orderModel = require('../model/order');



const updateOrderStatuses = async () => {
    const now = new Date();
    console.log(`[Order Scheduler] Running update check at ${now.toISOString()}`);

    try {

        console.log("[Step 1] Updated PENDING orders to PROCESSING.");

        // PENDING => PROCESSING (After 1 day)
        const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        
        await orderModel.updateMany(
            { 
                orderStatus: 'PENDING', 
                createdAt: { $lt: oneDayAgo } // Những đơn hàng được tạo trước 1 ngày
            },
            { 
                $set: { 
                    orderStatus: 'PROCESSING' 
                } 
            }
        );


        console.log("[Step 2] Updated PROCESSING orders to SHIPPED.");
        // PROCESSING => SHIPPED (After 1 day)
        await orderModel.updateMany(
            { 
                orderStatus: 'PROCESSING', 
                updatedAt: { $lt: oneDayAgo } // Giả định đơn hàng đã ở trạng thái PROCESSING ít nhất 1 ngày
            },
            { 
                $set: { 
                    orderStatus: 'SHIPPED' 
                } 
            }
        );


        console.log("[Step 3] Updated SHIPPED orders to DELIVERED.");
        // SHIPPED => DELIVERED (After 2 days)
        const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

        await orderModel.updateMany(
            { 
                orderStatus: 'SHIPPED', 
                updatedAt: { $lt: twoDaysAgo } // Giả định đơn hàng đã ở trạng thái SHIPPED ít nhất 2 ngày
            },
            { 
                $set: { 
                    orderStatus: 'DELIVERED',
                    deliveredAt: now // Cập nhật thời điểm giao hàng
                } 
            }
        );
        

        console.log("[Order Scheduler] All scheduled status updates completed successfully.");


    } catch (error) {
        console.error("[Order Scheduler] ERROR updating statuses:", error);
    }
};


const initOrderScheduler = () => {
    // Lịch trình chạy mỗi ngày một lần vào lúc 00:00 (nửa đêm)
    cron.schedule('0 0 0 * * *', updateOrderStatuses, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });

    console.log("[Order Scheduler] Cron job initialized (runs daily at midnight).");

    updateOrderStatuses(); 
};

module.exports = { initOrderScheduler };