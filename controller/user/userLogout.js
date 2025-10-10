
async function userLogoutController(req,res) {
    try {
        console.log("Logout")
    
        res.clearCookies("token")

        res.json({
            message : "Logout successfully",
            error : false,
            success : true,
            data : []
        })

    } catch (err) {
        res.json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = userLogoutController