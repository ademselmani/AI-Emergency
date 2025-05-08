const JWT = require("jsonwebtoken");
const User = require("../models/employee.model");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const jwt = require('jsonwebtoken');
const { image } = require("@tensorflow/tfjs-core");
// Configuration de node-canvas pour face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
// Configuration de Multer pour stocker l'image dans le dossier uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Assurez-vous que ce dossier existe
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");
// Fonction pour vérifier le format de l'image
function isSupportedImageType(imageData) {
  const base64Regex = /data:image\/(jpeg|png);base64,/;
  const match = imageData.match(base64Regex);
  
  if (!match) {
    console.error('❌ Format d\'image non valide');
    return false;
  }

  const fileType = match[1];
  console.log("📂 Type d'image détecté :", fileType);
  return ['jpeg', 'png'].includes(fileType);
}

// Fonction pour extraire le descripteur facial
 async function extractFaceDescriptor(imageData) {
  try {
    console.log("🔍 Vérification du format de l'image...");
    if (!isSupportedImageType(imageData)) {
      throw new Error("Format d'image non supporté");
    }

    console.log("📤 Conversion de l'image en buffer...");
    const buffer = Buffer.from(imageData.split(',')[1], 'base64');
    const tempImagePath = 'tempImage.jpg';
    fs.writeFileSync(tempImagePath, buffer);
    console.log("📸 Image enregistrée temporairement:", tempImagePath);

    console.log("📥 Chargement de l'image avec canvas...");
    const img = await canvas.loadImage(tempImagePath);
    console.log("✅ Image chargée dans canvas :", img.width, "x", img.height);

    const c = canvas.createCanvas(img.width, img.height);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    console.log("🎨 Image dessinée sur le canvas");

    console.log("🤖 Détection du visage...");
    const detections = await faceapi
      .detectAllFaces(c)
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log("📸 Nombre de visages détectés :", detections.length);
    if (detections.length === 0) {
      throw new Error("Aucun visage détecté !");
    }

    console.log("✅ Visage détecté :", detections[0].descriptor.length, "dimensions");
    return Array.from(detections[0].descriptor);
  } catch (error) {
    console.error("🚨 Erreur lors de l'extraction du descripteur facial :", error);
   
  }
}

const signup = async (data) => {
  try {
    console.log("📦 Données reçues dans signup:", data)

    const requiredFields = [
      "cin",
      "name",
      "familyName",
      "gender",
      "email",
      "role",
      "phone",
      "password",
      "imageFile",
    ]
    const missingFields = requiredFields.filter(
      (field) => !data[field] || data[field] === ""
    )
    if (missingFields.length > 0) {
      throw new Error(`Champs requis manquants: ${missingFields.join(", ")}`)
    }

    if (!data.imageFile || !data.imageFile.path) {
      throw new Error("❌ Aucune image fournie !")
    }

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { cin: data.cin }],
    })
    if (existingUser) {
      if (existingUser.email === data.email)
        throw new Error("Email already exists")
      if (existingUser.cin === data.cin) throw new Error("CIN already exists")
    }

    const imageData = `data:image/jpeg;base64,${fs
      .readFileSync(data.imageFile.path)
      .toString("base64")}`
    const faceDescriptor = await extractFaceDescriptor(imageData)
    if (!faceDescriptor || faceDescriptor.length === 0) {
      throw new Error("❌ Aucun visage détecté dans l'image !")
    }

    // Vérifier si ce visage est déjà utilisé
    const existingUsers = await User.find({ faceDescriptor: { $exists: true } })

    let isFaceUsed = false
    for (const existingUser of existingUsers) {
      if (
        !existingUser.faceDescriptor ||
        existingUser.faceDescriptor.length === 0
      )
        continue

      // Convertir les descripteurs en Float32Array pour comparaison
      const storedDescriptor = new Float32Array(existingUser.faceDescriptor)
      const currentDescriptor = new Float32Array(faceDescriptor)

      const distance = faceapi.euclideanDistance(
        currentDescriptor,
        storedDescriptor
      )
      console.log(`📏 Distance avec ${existingUser.email}:`, distance)

      if (distance < 0.4) {
        // 0.4 = seuil strict pour considérer que c'est la même personne
        isFaceUsed = true
        break
      }
    }

    if (isFaceUsed) {
      throw new Error("❌ Ce visage est déjà associé à un autre compte.")
    }

    // Créer un nouvel utilisateur avec le descripteur facial (sans sauvegarder l'image)
    const user = new User({
      cin: data.cin,
      name: data.name,
      familyName: data.familyName,
      gender: data.gender,
      email: data.email,
      role: data.role,
      phone: data.phone,
      password: data.password, // Let the pre-save hook hash the password
      image: "http://localhost:3000/" + data.imageFile.path,
      faceDescriptor, // Stocke uniquement le descripteur facial
      status: "active",
    })

    console.log("New User document:", user)

    // Sauvegarder l'utilisateur dans la base de données
    await user.save()
    console.log(
      `✅ Utilisateur enregistré avec succès : ${user.name} (${user.email})`
    )

    // Générer un token JWT après l'enregistrement
    const token = JWT.sign({ id: user._id, role: user.role }, "jwtSecret")

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: token,
      status: user.status,
    }
  } catch (error) {
    console.error("❌ Erreur dans signup:", error.stack)
    throw error // Ensure error is propagated
  }
}


// Connexion d'un utilisateur (avec ou sans reconnaissance faciale)



const login = async (data) => {
  try {
    console.log("🔑 Tentative de connexion :", data.email);

    const user = await User.findOne({ email: data.email });
    if (!user) {
      console.error("❌ Utilisateur introuvable");
      throw { status: 404, message: "Utilisateur non trouvé" };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      console.error("❌ Mot de passe incorrect");
      throw { status: 401, message: "Email ou mot de passe incorrect" };
    }

    const token = JWT.sign({ id: user._id, role: user.role }, "jwtSecret", { expiresIn: "7d" });

    console.log(`✅ Connexion réussie pour : ${user.email}`);

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error.message || error);
    throw error;
  }
};

const loginface = async (imageData) => {
  if (!imageData) {
    throw new Error("Image data est requise pour la reconnaissance faciale");
  }

  // Extraire le descripteur facial de l'image fournie
  const capturedDescriptor = await extractFaceDescriptor(imageData);
  if (!capturedDescriptor || capturedDescriptor.length === 0) {
    throw new Error("Aucun visage détecté dans l'image fournie");
  }

  // Récupérer tous les utilisateurs disposant d'un faceDescriptor
  const users = await User.find({ faceDescriptor: { $exists: true, $ne: null } });
  let foundUser = null;
  let minDistance = Infinity;

  // Pour chaque utilisateur, calculer la distance euclidienne entre le descripteur capturé et celui stocké
  for (let user of users) {
    if (!user.faceDescriptor || user.faceDescriptor.length === 0) continue;
    const distance = faceapi.euclideanDistance(capturedDescriptor, user.faceDescriptor);
    console.log(`🔍 Distance avec ${user.name} : ${distance}`);
    if (distance < minDistance) {
      minDistance = distance;
      foundUser = user;
    }
  }

  const threshold = 0.4; // Seuil de correspondance faciale
  if (foundUser && minDistance < threshold) {
    // Générer un token JWT
    const token = JWT.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET || "jwtSecret",
      { expiresIn: "1h" }
    );
    return {
      userId: foundUser._id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      token,
    };
  } else {
    throw new Error("Reconnaissance faciale échouée");
  }
};


module.exports = {
  extractFaceDescriptor,
  loginface,
  signup,
  login,
  upload
};
