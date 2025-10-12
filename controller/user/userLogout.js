
async function userLogoutController(req,res) {
    try {
        console.log("Logout request")
    
        res.clearCookies("token")

        console.log("Logout successfully")

        res.json({
            message : "Logout successfully",
            error : false,
            success : true,
            data : []
        })

    } catch (err) {
        console.log("UserLogout Controller ERROR:", err.message)
        
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userLogoutController