const checkAdminPermission = require("../../helpers/permission")
const userModel = require("../../models/userModel")

async function updateUser(req,res) {
    try {
        console.log("Update request for userId:", req.userId)

        const sessionUser = req.userId

        const {userId, email, name, role} = req.body
        
        // neu email ton tai thi them email vao object, k thi bo qua
        const payload = {
            ...(email && {email : email}),
            ...(name && {name : name}),
            ...(role && {role : role})
        }

        const user = await userModel.findById(sessionUser)

        if (userId && sessionUser !== userId) {
            if(!checkAdminPermission(sessionUser)){
                throw new Error("Permission denied")
            }
        }

        const updateUser = await userModel.findByIdAndUpdate(userId, payload, {new:true})

        console.log("Update user successfully:", updateUser)

        res.json({
            data : updateUser,
            message :  "User updated",
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

module.exports = updateUser