const userModel = require("../../model/userModel")

async function allUser(req,res) {
    try {
         console.log("Fetch all users request received");

        const allUsers = await userModel.find()

        console.log("Successfully fetched all user");

        res.json({
            message : "All User",
            data : allUsers,
            success : true,
            error : false
        })

    } catch (err) {
        console.log("AllUser Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });
        
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = allUser