const userModel = require("../../models/userModel")
const bcrypt = require('bcryptjs')

async function userSignUpController(req, res){
    try {
        const { email, password, name } = req.body

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
        const saveUser = userData.save()

        res.status(201).json({
            data : saveUser, 
            siccess : true,
            error : false,
            message : "User created Successfully!"
        })
        
    } catch (err) {
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userSignUpController