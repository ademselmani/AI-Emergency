var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
const mongoose = require("mongoose")
const passport = require("passport")
const configDB = require("./src/config/db.json")
const employeeRoute = require("./src/routes/employeeRoute")
require("./src/middlewares/auth/auth")
const authRoute = require("./src/routes/authRoute")
const cors = require("cors")

// Initialize express
var app = express()

// Enable CORS
app.use(cors())

// MongoDB connection
mongoose
  .connect(configDB.mongo.uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// View engine setup
app.set("views", path.join(__dirname, "src/views"))
app.set("view engine", "jade")

// Middlewares
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/", authRoute)
// app.use("/user", employeeRoute)
app.use('/user', passport.authenticate('jwt', { session: false }), employeeRoute);


// 404 Error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// Global error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}
  res.status(err.status || 500)
  res.render("error")
})

// Start server
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})

module.exports = app
