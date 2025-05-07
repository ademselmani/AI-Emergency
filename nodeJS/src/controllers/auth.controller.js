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
    console.log("Données reçues dans req.body :", req.body)
    console.log("Fichier image reçu :", req.file)

    const { cin, name, familyName, gender, email, role, phone, password } =
      req.body
    const imageFile = req.file

    const requiredFields = {
      cin,
      name,
      familyName,
      gender,
      email,
      role,
      phone,
      password,
    }
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value === "")
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Champs requis manquants",
        errors: missingFields.reduce((acc, field) => {
          acc[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } est requis`
          return acc
        }, {}),
      })
    }

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: "Image requise",
        errors: { image: "Une image est requise" },
      })
    }

    const result = await signup({
      cin,
      name,
      familyName,
      gender,
      email,
      role,
      phone,
      password,
      imageFile,
    })

    return res.status(201).json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error.stack) // More detailed logging

    const errorResponses = {
      "Email already exists": {
        status: 409,
        errors: { email: "Cet email est déjà enregistré" },
      },
      "CIN already exists": {
        status: 409,
        errors: { cin: "Ce CIN est déjà enregistré" },
      },
      "❌ Aucun visage détecté dans l'image !": {
        status: 400,
        errors: { image: "Aucun visage détecté dans l'image fournie" },
      },
      "❌ Aucune image fournie !": {
        status: 400,
        errors: { image: "Aucune image fournie" },
      },
    }

    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message
        return acc
      }, {})
      return res.status(400).json({
        success: false,
        message: "Erreur de validation",
        errors,
      })
    }

    const errorConfig = errorResponses[error.message] || {
      status: 500,
      errors: { general: error.message || "Erreur serveur inconnue" },
    }

    return res.status(errorConfig.status).json({
      success: false,
      message: error.message,
      errors: errorConfig.errors,
    })
  }
}

const loginController = async (req, res, next) => {
    try {
        const loginService = await login(req.body);
        return res.json(loginService);
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message || "Erreur serveur" });    }
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

  const Verify2FAController = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
  
      // Générer le token de réinitialisation
      const configDb = require("../config/db.json");
      const tempCode = Math.floor(100000 + Math.random() * 900000);;
  
      user.verifyCode = tempCode;
      await user.save();
      const user2 = await User.findOne({ email });
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
        text: `Utilisez ce code pour rediriger vers votre compte: ${tempCode}`,
      };
  
      // Envoyer l'email
      await transporter.sendMail(mailOptions);
  
      res.json({ message: "2FA code envoyé" });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'e-mail :", err); // Loguer l'erreur
      res.status(500).json({ error: err.message });
    }
  };
  
  const VerifyCode = async (req, res) => {
    try {
      const { email , code } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
      
      if(user.verifyCode == code) {
        user.verifyCode = ""
        await user.save()
        res.json({ message: "correct code" });
      } else {
        console.error("correct code :", err); // Loguer l'erreur
        res.status(500).json({ error: err.message });
      }
     
    
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'e-mail :", err); // Loguer l'erreur
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
    googleAuthController,
    Verify2FAController,
    VerifyCode

};