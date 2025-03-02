const createError = require("http-errors");
const http = require("http");
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const configDB = require("./src/config/db.json");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");

// Charger node-canvas et patcher face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const authRoute = require("./src/routes/index.route");
// const employeeRoute = require("./src/routes/employee.route"); // Si nécessaire

// Connexion à MongoDB
mongoose
  .connect(configDB.mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur de connexion MongoDB:", err));

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" })); // augmenter la taille si besoin
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));




// Montons nos routes
app.use("/api/auth", authRoute);
// app.use("/employee", employeeRoute); // Si besoin

// Gestion des erreurs 404
app.use((req, res, next) => {
  next(createError(404));
});

// Gestion centrale des erreurs
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Chargement des modèles face-api.js
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
  
 


// Démarrage du serveur
server.listen(3000, () => {
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});



// Exporter à la fois l'app et le serveur
module.exports = { app, server };
