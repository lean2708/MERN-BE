const userModel = require("../model/userModel");
const checkAdminPermission = require("../helpers/permission");

const userController = {

    // Get User Details
    getUserDetails: async (req, res) => {
        try {
            console.log("Get User Details request By userId :", req.userId);
            const user = await userModel.findById(req.userId);
            console.log("Get User Details successfully :", user);

            res.status(200).json({
                data: user,
                error: false,
                success: true,
                message: "User details"
            });

        } catch (err) {
            console.log("UserDetails Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },



    // Fetch All Users - Admin only
    getAllUsers: async (req, res) => {
        try {
            console.log("Fetch all users request received by:", req.userId);

            // Bắt buộc phải là Admin
            if (!checkAdminPermission(req.userId)) {
                throw new Error("Permission denied");
            }

            const allUsers = await userModel.find();

            console.log("Successfully fetched all user");

            res.json({
                message: "Fetch All User",
                data: allUsers,
                success: true,
                error: false
            });

        } catch (err) {
            console.log("AllUser Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    },

    

    // Update User - Self or Admin
    updateUser: async (req, res) => {
        try {
            const sessionUserId = req.userId; 
            const { userId, email, name, role } = req.body; 

            console.log(`Update request from ${sessionUserId} for target user ${userId}`);

            const isAdmin = checkAdminPermission(sessionUserId);

            // neu email ton tai thi them email vao object, k thi bo qua
            const payload = {
                ...(email && { email: email }),
                ...(name && { name: name }),
            };

            let targetUserId = userId; 

            // Người dùng tự cập nhật thông tin của mình
            if (sessionUserId === targetUserId) {
                // Check xem admin có tự cập nhật role không
                if (role && isAdmin) {
                    payload.role = role;
                }
                // Người dùng thường cố update role -> bỏ qua 
                else if (role && !isAdmin) {
                     console.warn(`Security: User ${sessionUserId} tried to update their own role. Ignored.`);
                }
            }
            // Admin cập nhật thông tin người khác
            else if (sessionUserId !== targetUserId && isAdmin) {
                // Admin được phép cập nhật role
                if (role) {
                    payload.role = role;
                }
            }
            // Người dùng muốn câp nhật thông tin người khác mà không phải admin
            else if (sessionUserId !== targetUserId && !isAdmin) {
                 throw new Error("Permission denied. You can only update your own profile.");
            }

            if (!targetUserId) {
                throw new Error("Missing target userId for update.");
            }

            const updatedUser = await userModel.findByIdAndUpdate(targetUserId, payload, { new: true });

            if (!updatedUser) {
                throw new Error("User not found or update failed.");
            }
            
            console.log("Update user successfully:", updatedUser);

            res.json({
                data: updatedUser,
                message: "User updated",
                success: true,
                error: false
            });

        } catch (err) {
            console.log("UpdateUser Controller ERROR:", {
                message: err.message,
                stack: err.stack
            });
            res.status(400).json({
                message: err.message || err,
                error: true,
                success: false
            });
        }
    }
};

module.exports = userController;