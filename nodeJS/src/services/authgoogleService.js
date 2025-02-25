const jwt = require("jsonwebtoken");
const User = require("../models/employee.model");
const bcrypt = require("bcryptjs");

const googleAuth = async (req) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("Authentification Google échouée.");
    }

    // Vérifier si Google a renvoyé un email
    if (!user.emails || user.emails.length === 0) {
      throw new Error("Aucune adresse email trouvée dans le profil Google.");
    }

    const userEmail = user.emails[0].value; // Email principal

    // Vérifier si l'utilisateur existe déjà
    let existingUser = await User.findOne({ email: userEmail });

    if (!existingUser) {
      // Générer un mot de passe aléatoire car Google ne fournit pas de mot de passe
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Définir un rôle valide (vérifier avec votre schéma)
      const validRole = "USER"; // Assurez-vous que ce rôle existe dans votre modèle

      // Créer un nouvel utilisateur
      existingUser = new User({
        name: user.displayName || "Utilisateur Google",
        email: userEmail,
        password: hashedPassword, // Mot de passe haché
        role: validRole, // Rôle valide
      });

      await existingUser.save();
    }

    // Vérifier si le compte est actif
    if (!existingUser.isActive) {
      throw new Error("Votre compte est désactivé. Veuillez contacter l'administrateur.");
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1h" }
    );

    // Retourner les mêmes informations que la fonction login
    return {
      userId: existingUser._id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      token,
    };
  } catch (error) {
    console.error("🚨 Erreur Google Auth:", error.message);
    throw new Error(error.message);
  }
};

module.exports = { googleAuth };