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


const configDB = require("./src/config/db.json");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const authRoute = require("./src/routes/index.route");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });



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
app.use(passport.initialize());
app.use(passport.session());

// ✅ **Routes**
app.use("/api/auth", authRoute);



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
