const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const router = require('./routes/index')
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")
// load cac bien env
require("dotenv").config()



const app = express()

app.use(express.json())

app.use("/api",router)

app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))

app.use(cookieParser())

const PORT = process.env.PORT || 8080;


connectDB().then(()=>{
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    });
})


// serve swagger JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
