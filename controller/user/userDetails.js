const userModel = require("../../models/userModel")

async function userDetailsController(req,res) {
    try {
        console.log("Get User Details request By userId :", req.userId)

        const user = await userModel.findById(req.userId)

        console.log("Get User Details successfully :", user)

        res.status(200).json({
            data : user,
            error : false,
            success : true,
            message : "User details"
        })

    } catch (err) {
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userDetailsController