const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

//models

const app = express()
const cors = require('cors')

//Middleware
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
app.use("/images", express.static(path.join(__dirname, "images")));

//MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MONGODB Connected"))
    .catch((err) => console.log(err))

//API Routes
app.use("/api/auth", require("./routes/userRoutes"))
app.use("/api/orders", require("./routes/orderRoutes"))
app.use("/api/analytics", require("./routes/analyticsRoutes"))
app.use("/api", require("./routes/productRoutes"))

//Error Handling
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    })
})

const port = 8000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})