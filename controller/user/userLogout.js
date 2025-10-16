
async function userLogoutController(req,res) {
    try {
        console.log("Logout request")
    
        res.clearCookie("token")

        console.log("Logout successfully")

        res.json({
            message : "Logout successfully",
            error : false,
            success : true,
            data : []
        })

    } catch (err) {
        console.log("UserLogout Controller ERROR:", {
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

module.exports = userLogoutController