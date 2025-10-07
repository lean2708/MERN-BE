const userModel = require("../../models/userModel")

async function allUser(req,res) {
    try {
        console.log("UserId All user", req.userId)

        const allUsers = await userModel.find()

        res.json({
            message : "All User",
            data : allUser,
            success : true,
            error : false
        })

    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = allUser