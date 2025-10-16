const jwt = require('jsonwebtoken');



function generateToken(userId, email, expiresIn){
    const tokenData = {
        _id : userId,
        email : email
    }

    return jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn });
}


function verifyToken(token){
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}


module.exports = {
    generateToken,
    verifyToken
};