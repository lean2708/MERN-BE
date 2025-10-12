const bcrypt = require('bcryptjs')
const userModel = require("../../models/userModel")
jwt = require('jsonwebtoken')

async function userSignInController(req,res) {
    try {
        const { email, password } = req.body

        console.log("Login request receive for email :", email)

        if(!email){
            throw new Error("Please provide email")
        }
         if(!password){
            throw new Error("Please provide password")
        }

         const user = await userModel.findOne({email})

        if(!user){
            throw new Error("User not found")
        }

        const checkPassword = await bcrypt.compare(password, user.password)

        if (checkPassword) {
            // payload
            const tokenData = {
                _id : user._id,
                email : user.email
            }

            // create token (100 gio)
            const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: 60 * 60 * 100 });

            const tokenOption = {
                httpOnly : true,
                secure : user.email
            }

            console.log("Login Successfully :", email)

            res.cookie("token", token, tokenOption).json({
                message : "Login successfully",
                data : token,
                sucess : true,
                error : false
            })

        } else {
            throw new Error("Please check Password")   
        }
        
    } catch (err) {
        console.log("UserSignIn Controller ERROR:", err.message)

        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userSignInController