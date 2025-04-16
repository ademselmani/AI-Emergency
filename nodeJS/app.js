const createError = require("http-errors");
const http = require("http");
const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const multer = require("multer");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const { Server } = require("socket.io");
require("dotenv").config();
require("./src/config/passport");

// Canvas setup pour face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Models & Services
const { extractFaceDescriptor } = require("./src/services/auth.service");
const Demande = require("./src/models/demande");
const { sendEmail } = require("./src/controllers/emailController");
const configDB = require("./src/config/db.json");

// Routes
const authRoute = require("./src/routes/index.route");
const employeeRoute = require("./src/routes/employeeRoute");
const employeeFind = require("./src/routes/employee.route");
const areaRoutes = require("./src/routes/areaRoute");
const roomRoutes = require("./src/routes/roomRoute");
const equipmentRoutes = require("./src/routes/equipmentRoute");
const patientRoutes = require("./src/routes/patientRoutes");
const shiftRoutes = require("./src/routes/shifts.route");
const leaveRoute = require("./src/routes/leaveRoute");
const treatmentRoutes = require("./src/routes/treatmentRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const demandeRoutes = require("./src/routes/demandeRoutes");
const { getAnomalies, getForecast } = require('./src/services/aiService');

// MongoDB connection
mongoose.connect(configDB.mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Express + HTTP + Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
  },
});

// Middleware globaux
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Sessions & Auth
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passage de `io` à toutes les requêtes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Multer (Upload d'image)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Upload avec reconnaissance faciale
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("Aucun fichier uploadé.");

  const imageData = `data:image/jpeg;base64,${fs
    .readFileSync(req.file.path)
    .toString("base64")}`;

  try {
    const faceDescriptor = await extractFaceDescriptor(imageData);
    if (!faceDescriptor || faceDescriptor.length === 0) {
      throw new Error("❌ Aucun visage détecté dans l'image !");
    }

    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("🚨 Erreur face descriptor:", error);
    res.status(500).json({ error: "Erreur traitement image." });
  }
});

// Static pour uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes API
app.use("/api/auth", authRoute);
app.use("/user", employeeRoute);
app.use("/employee", employeeFind);
app.use("/areas", areaRoutes);
app.use("/rooms", roomRoutes);
app.use("/equipments", equipmentRoutes);
app.use("/api/leaves", leaveRoute);
app.use("/api", patientRoutes);
app.use("/shifts", shiftRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/demandes", demandeRoutes);
app.use("/api/send-email", sendEmail);
app.get('/api/anomalies', async (req, res) => res.json(await getAnomalies()));
app.get('/api/forecast', async (req, res) => res.json(await getForecast()));

// Chargement des modèles face-api.js
const MODEL_URL = path.join(__dirname, "/model");
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
])
.then(() => console.log("✅ Modèles face-api.js chargés"))
.catch((error) => console.error("❌ Erreur chargement modèles:", error));

// Socket.IO : Ambulance + Maintenance
let ambulancePosition = { lat: 48.8566, lng: 2.3522 };
io.on("connection", (socket) => {
  console.log("✅ Socket connecté:", socket.id);

  socket.on("ambulancePositionUpdate", (newPos) => {
    ambulancePosition = newPos;
    io.emit("ambulancePosition", newPos);
  });

  socket.on("demandeAmbulance", async (position) => {
    try {
      const demande = new Demande({ position, status: "En attente" });
      await demande.save();
      io.emit("nouvelleDemande", demande);
    } catch (error) {
      console.error("❌ Erreur création demande:", error);
    }
  });

  socket.on("validerDemande", async (id) => {
    try {
      await Demande.findByIdAndUpdate(id, { status: "Acceptée" });
      io.emit("demandeAcceptée", id);
    } catch (error) {
      console.error("❌ Erreur validation demande:", error);
    }
  });

  socket.on("equipmentUpdate", (updatedEquipment) => {
    io.emit("equipmentUpdate", updatedEquipment);
  });

  socket.on("maintenanceNotification", (notification) => {
    io.emit("maintenanceNotification", notification);
  });
});

// Mouvement simulé de l’ambulance
setInterval(() => {
  ambulancePosition.lat += 0.0001;
  ambulancePosition.lng += 0.0001;
  io.emit("ambulancePosition", ambulancePosition);
}, 3000);

// Gestion des erreurs
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Démarrage du serveur
server.listen(3000, () => {
  console.log("🚀 Serveur en ligne sur http://localhost:3000");
});

module.exports = { app, server, io };
