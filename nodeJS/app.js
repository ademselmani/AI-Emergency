const createError = require("http-errors");
const http = require("http");
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport"); // 🔥 Import Passport
require("dotenv").config();
require("./src/config/passport"); // 🔥 Load Passport config
const employeeRoute = require("./src/routes/employeeRoute")
const employeeFind = require("./src/routes/employee.route")
const multer = require("multer")

const configDB = require("./src/config/db.json");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const authRoute = require("./src/routes/index.route");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const patientRoutes = require('./src/routes/patientRoutes');


mongoose
  .connect(configDB.mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  // .then(() => console.log("✅ Connecté à MongoDB"))
  // .catch((err) => console.error("", err));

const app = express();
const server = http.createServer(app);

// ✅ **Middlewares**
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ✅ **Session & Passport Middleware**
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

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
  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Servir les fichiers statiques depuis le dossier 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());
app.use(passport.session());

// ✅ **Routes**
app.use("/api/auth", authRoute);
app.use("/user", employeeRoute)
app.use("/employee", employeeFind)
app.use('/api', patientRoutes);


// ✅ **Central Error Handling**
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// ✅ **Load face-api.js Models**
const MODEL_URL = path.join(__dirname, "/model");
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
])
  .then(() => {
    console.log("✅ Modèles face-api.js chargés avec succès !");
  })
  .catch((error) => {
    console.error("❌ Erreur lors du chargement des modèles face-api.js :", error);
  });
 

  // ✅ **Handle 404 Errors**
app.use((req, res, next) => {
  next(createError(404));
});
  

server.listen(3000, () => {
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});
