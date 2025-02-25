// middlewares/uploadMiddleware.js
const multer = require("multer");

// Définir le stockage (ici, par exemple, sur le disque dans le dossier "uploads")
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Assurez-vous que ce dossier existe ou gérez la création dynamique
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Créer l'instance de multer avec le stockage défini
const upload = multer({ storage });

module.exports = upload;
