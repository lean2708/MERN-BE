const bcrypt = require('bcryptjs')
const userModel = require("../../model/userModel")
const { generateToken } = require('../../service/jwtService')
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

            // create token 
            const token = generateToken(user._id, email, parseInt(process.env.TOKEN_EXPIRE) * 60);

            const tokenOption = {
                httpOnly : true,
                secure : user.email
            }

            console.log("Login Successfully :", email)

            res.cookie("token", token, tokenOption).json({
                message : "Login successfully",
                data : token,
                success : true,
                error : false
            })

        } else {
            throw new Error("Please check Password")   
        }
        
    } catch (err) {
        console.log("UserSignIn Controller ERROR:", {
            message: err.message,
            stack: err.stack
        });

        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userSignInController