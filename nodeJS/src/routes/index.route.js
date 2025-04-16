const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  signUpController,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  loginFaceController,
  googleAuthController,
  Verify2FAController,
  VerifyCode
} = require("../controllers/auth.controller");
const upload = require("../middlewares/auth/uploadMiddleware");

// Routes
router.post("/loginface", loginFaceController);
router.post("/signup", upload.single("image"), signUpController);
router.post("/login", loginController);
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/verifyCode", Verify2FAController);
router.post("/codeVerified", VerifyCode);

// Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthController // Utilisez le contrôleur pour gérer la redirection
);

module.exports = router;