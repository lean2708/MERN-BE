
const userModel = require("../model/userModel");

const checkAdminPermission = async (userId) => {
    try {
        const user = await userModel.findById(userId);

        if (!user || user.role !== 'ADMIN') {
            return false; 
        }

        return true; 

    } catch (error) {
        console.error("Permission Check Error:", error.message);
        return false;
    }
}

module.exports = checkAdminPermission;