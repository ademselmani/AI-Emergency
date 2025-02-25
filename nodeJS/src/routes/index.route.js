const {
  signUpController,
  loginController,
  forgetPasswordController,
  resetPasswordController,
  loginFaceController,
 
} = require("../controllers/auth.controller");



const upload = require("../middlewares/auth/uploadMiddleware");


const Employee = require("../models/employee.model");
const bcrypt = require("bcrypt");

const router = require("express").Router();
router.post("/loginface", loginFaceController);  // Route de connexion via reconnaissance faciale
router.post("/signup", upload.single('image'), signUpController);
router.post("/login", loginController);
router.post("/forget-password", forgetPasswordController);
router.post("/reset-password", resetPasswordController);






module.exports = router;
