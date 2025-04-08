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
require("dotenv").config();
require("./src/config/passport");
const employeeRoute = require("./src/routes/employeeRoute")
const employeeFind = require("./src/routes/employee.route")
const areaRoutes = require("./src/routes/areaRoute")
const roomRoutes = require("./src/routes/roomRoute")
const equipmentRoutes = require("./src/routes/equipmentRoute")
const patientRoutes = require('./src/routes/patientRoutes');
const { Server } = require("socket.io");
const multer = require("multer")
const Demande = require("./src/models/demande"); // Ajout du modèle Demande

const configDB = require("./src/config/db.json");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const fs = require("fs");
const authRoute = require("./src/routes/index.route");
const leaveRoute = require("./src/routes/leaveRoute")
const treatmentRoutes = require('./src/routes/treatmentRoutes');
const prescriptionRoutes = require('./src/routes/prescriptionRoutes');
const demandeRoutes = require("./src/routes/demandeRoutes"); 

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Configuration MongoDB
mongoose.connect(configDB.mongo.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch((err) => console.error("", err));

const app = express();
const server = http.createServer(app);

// Configuration Socket.io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"]
    }
});

// Middlewares
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session & Passport
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret_key",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Configuration Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = "./uploads/"
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    },
});

const upload = multer({ storage: storage });

// Routes
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier uploadé.');
    }
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());
app.use(passport.session());

// ✅ **Routes**
app.use("/api/auth", authRoute);
app.use("/user", employeeRoute)
app.use("/employee", employeeFind)
app.use("/areas", areaRoutes)
app.use("/rooms", roomRoutes)
app.use("/equipments", equipmentRoutes)
app.use((req, res, next) => {
    req.io = io;
    next();
  });
app.use("/api/leaves", leaveRoute);
app.use('/api', patientRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/patients', patientRoutes);
app.use("/api/demandes", demandeRoutes); 

// Gestion des erreurs
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.json({ error: err.message });
});

// Face-API.js Models
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
    console.error("❌ Erreur lors du chargement des modèles :", error);
});





let ambulancePosition = { lat: 48.8566, lng: 2.3522 };
io.on("connection", (socket) => {
    socket.on("ambulancePositionUpdate", (newPos) => {
      io.emit("ambulancePosition", newPos);
    });
    
    socket.on("demandeAmbulance", async (position) => {
      try {
        const demande = new Demande({
          position,
          status: "En attente"
        });
        await demande.save();
        io.emit("nouvelleDemande", demande);
      } catch (error) {
        console.error("Erreur création demande:", error);
      }
    });
  
    socket.on("validerDemande", async (id) => {
      await Demande.findByIdAndUpdate(id, { status: "Acceptée" });
      io.emit("demandeAcceptée", id);
    });
  });

setInterval(() => {
    ambulancePosition.lat += 0.0001;
    ambulancePosition.lng += 0.0001;
    io.emit("ambulancePosition", ambulancePosition);
}, 3000);


server.listen(3000, () => {
  console.log("🚀 Serveur démarré sur http://localhost:3000");
});

module.exports = { app, server };