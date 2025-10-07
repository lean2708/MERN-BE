const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const router = require('./routes/index')
// load cac bien env
require("dotenv").config()


const app = express()
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))
app.use(express.json())
app.use(cookieParser())


app.use("/api",router)



const PORT = 8080 || process.env.PORT;



connectDB().then(()=>{
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    });
})



