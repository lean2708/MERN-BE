const userModel = require("../../models/userModel")
const bcrypt = require('bcryptjs')

async function userSignUpController(req, res){
    try {
        // Gan req.body vao cac bien
        const { email, password, name } = req.body

        console.log("Register request recive for email :", email)

        const user = await userModel.findOne({email})

        if(user){
            throw new Error("Already user exist")
        }

        if(!email){
            throw new Error("Please provide email")
        }
         if(!password){
            throw new Error("Please provide password")
        }
         if(!name){
            throw new Error("Please provide name")
        }

         const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hashSync(password, salt);

        if(!hashPassword){
            throw new Error("Something is wrong")
        }

        // copy full req
        const payload = {
            ...req.body,
            password : hashPassword
        }

        const userData = new userModel(payload)
        const saveUser = await userData.save()

        console.log("User created successfully:", saveUser.email);

        res.status(201).json({
            data : saveUser, 
            siccess : true,
            error : false,
            message : "User created successfully!"
        })
        
    } catch (err) {
         console.log("UserSignUp Controller ERROR:", err.message)

        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userSignUpController