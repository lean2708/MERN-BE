const jwt = require('jsonwebtoken')


async function authToken(req,res,next) {
    try {
        // Get token from cookie or header Authorization
        const token = req.cookies?.token || req.headers['authorization']

        if(!token){
            return res.status(400).json({
                message : "Please login...!",
                error : true,
                success : false
            })
        }

        // Verify Token
        const decoded = verifyToken(token);

        if (!decoded?._id) {
            throw new Error("Invalid token structure");
        }

        console.log("decoded", decoded)

        req.userId = decoded._id;

        next();

    } catch (err) {
         console.log("authToken ERROR:", err.message);
         
        res.status(400).json({
            message : err.message || err,
            data : [],
            error : true,
            success : false
        })
    }
}

module.exports = authToken