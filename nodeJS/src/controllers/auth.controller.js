// controllers/auth.controller.js
const User = require("../models/employee.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { googleAuth } = require("../services/authgoogleService"); // Importation du service Google

const {loginface,
    signup,
    login
  } = require("../services/auth.service");
  
  const signUpController = async (req, res) => {
  try {
    const { name,familyName , email, role, phone, password } = req.body;
    const imageFile = req.file;
    

    // Appel du service d'inscription
    const { userId, email: userEmail, name: userName, role: userRole, token } = await signup({ 
      name, 
      familyName ,
      email, 
      role, 
      phone, 
      password, 
      imageFile ,
    });

    // Réponse en cas de succès
    return res.status(201).json({
      success: true,
      userId,
      email: userEmail,
      name: userName,
      role: userRole,
      token,
    });
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error);
    return res.status(500).json({ success: false, message: `❌ Erreur serveur: ${error.message}` });
  }
};

  


const loginController = async (req, res, next) => {
    try {
        const loginService = await login(req.body);
        return res.json(loginService);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
const loginFaceController = async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ success: false, message: "Image requise" });
    }

    console.log("🔑 Tentative de login via reconnaissance faciale...");
    const loginResult = await loginface(imageData);
    return res.status(200).json({ success: true, message: "Login réussi", ...loginResult });
  } catch (error) {
    console.error("🚨 Erreur lors du login par reconnaissance faciale :", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


const forgetPasswordController = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
  
      // Générer le token de réinitialisation
      const configDb = require("../config/db.json");
      const resetToken = jwt.sign({ id: user._id }, configDb.jwt.secret, { expiresIn: "15m" });
  
      user.resetToken = resetToken;
      await user.save();
  
      // Vérifier que l'email et le mot de passe SMTP sont bien configurés
      if (!configDb.email || !configDb.email.user || !configDb.email.pass) {
        return res.status(500).json({ message: "Configuration de l'email incorrecte" });
      }
  
      //  Configurer le transporteur SMTP
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: configDb.email.user,
          pass: configDb.email.pass,
        },
      });
  
      const mailOptions = {
        from: configDb.email.user,
        to: user.email,
        subject: "Réinitialisation du mot de passe",
        text: `Utilisez ce lien pour réinitialiser votre mot de passe: ${configDb.email.clientUrl}/reset/${resetToken}`,
      };
  
      // Envoyer l'email
      await transporter.sendMail(mailOptions);
  
      res.json({ message: "E-mail de réinitialisation envoyé" });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'e-mail :", err); // Loguer l'erreur
      res.status(500).json({ error: err.message });
    }
  };
  
  
  //  Réinitialisation du mot de passe avec le Token
  const resetPasswordController = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const configDb = require("../config/db.json");
      const decoded = jwt.verify(token, configDb.jwt.secret);
      const user = await User.findById(decoded.id);
  
      if (!user || user.resetToken !== token) {
        return res.status(400).json({ message: "Token invalide" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword, resetToken: "" } });
  
      res.json({ message: "Mot de passe mis à jour" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };



  const googleAuthController = async (req, res) => {
    try {
      const userData = await googleAuth(req);
      const { token, email } = userData;
  
      // Redirect to the frontend with token and email as query parameters
      res.redirect(`http://localhost:5173/login?token=${token}&email=${email}`);
    } catch (error) {
      // Redirect to the frontend with an error message if something goes wrong
      res.redirect(`http://localhost:5173/login?error=${error.message}`);
    }
  };



  module.exports = {
    signUpController,
    loginController,
    forgetPasswordController,
    resetPasswordController,
    loginFaceController,
    googleAuthController

};