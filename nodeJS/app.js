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
const multer = require("multer")
const fs = require("fs")

// Initialize express
var app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configuration de Multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./uploads/"
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Nom unique pour éviter les conflits
  },
})

const upload = multer({ storage: storage });

// Route pour l'upload d'image
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Aucun fichier uploadé.');
  }

  // Retourne l'URL de l'image uploadée
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Servir les fichiers statiques depuis le dossier 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use("/user", employeeRoute)
// app.use('/user', passport.authenticate('jwt', { session: false }), employeeRoute);


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
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`)
})

module.exports = app
