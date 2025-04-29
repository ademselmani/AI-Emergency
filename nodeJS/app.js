require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const multer = require("multer");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Server } = require("socket.io");

// Monkey patch pour face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// App, Server, Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"]
  }
});

// MongoDB config
const configDB = require("./src/config/db.json");
mongoose.connect(configDB.mongo.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => console.error("❌ Erreur MongoDB:", err));

// Middleware globaux
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: true,
}));

require("./src/config/passport");
app.use(passport.initialize());
app.use(passport.session());

// Passage de io à toutes les routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Multer pour upload image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload image + faceapi
const { extractFaceDescriptor } = require("./src/services/auth.service");
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("Aucun fichier uploadé.");
  const imageData = `data:image/jpeg;base64,${fs.readFileSync(req.file.path).toString("base64")}`;
  try {
    const descriptor = await extractFaceDescriptor(imageData);
    if (!descriptor || descriptor.length === 0) throw new Error("Aucun visage détecté !");
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error("❌ Face API error:", err);
    res.status(500).json({ error: "Erreur traitement image." });
  }
});

// Routes
const authRoute = require("./src/routes/index.route");
const employeeRoute = require("./src/routes/employeeRoute");
const employeeFind = require("./src/routes/employee.route");
const conversationRoutes = require("./src/routes/conversations");
const messageRoutes = require("./src/routes/messages");
const areaRoutes = require("./src/routes/areaRoute");
const roomRoutes = require("./src/routes/roomRoute");
const equipmentRoutes = require("./src/routes/equipmentRoute");
const patientRoutes = require("./src/routes/patientRoutes");
const shiftRoutes = require("./src/routes/shifts.route");
const leaveRoute = require("./src/routes/leaveRoute");
const treatmentRoutes = require("./src/routes/treatmentRoutes");
const prescriptionRoutes = require("./src/routes/prescriptionRoutes");
const demandeRoutes = require("./src/routes/demandeRoutes");
const { sendEmail } = require("./src/controllers/emailController");
const { getAnomalies, getForecast } = require('./src/services/aiService');
const auth = require('./src/middlewares/auth/auth');

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
app.use("/api/conversations", auth, conversationRoutes);
app.use("/api/messages", auth, messageRoutes);
app.get('/api/anomalies', async (req, res) => res.json(await getAnomalies()));
app.get('/api/forecast', async (req, res) => res.json(await getForecast()));
app.use('/api/conversations', conversationRoutes);

// Charger modèles face-api
const MODEL_URL = path.join(__dirname, "/model");
Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
]).then(() => {
  console.log("✅ Modèles face-api.js chargés");
}).catch(err => {
  console.error("❌ Erreur chargement modèles:", err);
});

// Socket.IO : unique handler fusionné
const Demande = require("./src/models/demande");
let ambulancePosition = { lat: 48.8566, lng: 2.3522 };

io.on("connection", socket => {
  console.log("✅ Socket connecté:", socket.id);

  // 🔁 Ambulance
  socket.on("ambulancePositionUpdate", (newPos) => {
    ambulancePosition = newPos;
    io.emit("ambulancePosition", newPos);
  });

  socket.on("demandeAmbulance", async (position) => {
    try {
      const demande = new Demande({ position, status: "En attente" });
      await demande.save();
      io.emit("nouvelleDemande", demande);
    } catch (err) {
      console.error("❌ Erreur création demande:", err);
    }
  });

  socket.on("validerDemande", async (id) => {
    try {
      await Demande.findByIdAndUpdate(id, { status: "Acceptée" });
      io.emit("demandeAcceptée", id);
    } catch (err) {
      console.error("❌ Erreur validation demande:", err);
    }
  });

  // 🛠️ Maintenance
  socket.on("equipmentUpdate", (data) => {
    io.emit("equipmentUpdate", data);
  });

  socket.on("maintenanceNotification", (notification) => {
    io.emit("maintenanceNotification", notification);
  });

  // 💬 Messagerie
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`📥 Socket ${socket.id} a rejoint la room ${conversationId}`);
  });
/*
  socket.on("sendMessage", ({ conversationId, message }) => {
    console.log("📤 Message reçu pour:", conversationId, message);
    socket.to(conversationId).emit("receiveMessage", message);
  });
*/
  socket.on("disconnect", () => {
    console.log("👤 Déconnecté:", socket.id);
  });
});

// 🚑 Simule déplacement ambulance
setInterval(() => {
  ambulancePosition.lat += 0.0001;
  ambulancePosition.lng += 0.0001;
  io.emit("ambulancePosition", ambulancePosition);
}, 3000);

// Erreurs
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Lancement serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});

module.exports = { app, server, io };
