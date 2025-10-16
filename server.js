// load cac bien env
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const router = require('./route/index')
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./swagger")



const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(cookieParser())

app.use("/api",router)

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
