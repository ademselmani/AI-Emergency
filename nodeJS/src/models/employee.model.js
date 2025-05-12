/** @format */

const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const employeeSchema = mongoose.Schema({
  cin: {
    type: String,
    //required: [true, "Le CIN est requis"],
    unique: [true, "Ce CIN existe déjà"],
    validate: {
      validator: function (v) {
        return /^[0-9]{8}$/.test(v)
      },
      message: "Le CIN doit avoir exactement 8 chiffres",
    },
  },
  name: {
    type: String,
    required: [true, "Le prénom est requis"],
    trim: true,
    minlength: [2, "Le prénom doit avoir au moins 2 caractères"],
    maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
  },
  familyName: {
    type: String,
    trim: true,
    minlength: [2, "Le nom de famille doit avoir au moins 2 caractères"],
    maxlength: [50, "Le nom de famille ne peut pas dépasser 50 caractères"],
  },
  image: String,
  birthday: Date,
  gender: {
    type: String,
    //required: [true, "Le genre est requis"],
    enum: {
      values: ["Man", "Woman"],
      message: "Le genre doit être 'Man' ou 'Woman'",
    },
  },
  phone: {
    type: String,
    required: [true, "Le numéro de téléphone est requis"],
    match: [
      /^\+?[1-9]\d{1,14}$/,
      "Veuillez entrer un numéro de téléphone valide",
    ],
  },
  imagePath: { type: String, required: false },
  faceDescriptor: { type: [Number], required: false },
  role: {
    type: String,
    required: [true, "Le rôle est requis"],
    enum: {
      values: [
        "admin",
        "doctor",
        "nurse",
        "triage_nurse",
        "receptionnist",
        "ambulance_driver",
      ],
      message: "Rôle invalide",
    },
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Veuillez entrer un email valide",
    ],
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"],
    minlength: [8, "Le mot de passe doit avoir au moins 8 caractères"],
  },

  resetToken: { type: String, default: "" },
  joinDate: Date,
  adresse: String,
  status: {
    type: String,
    default: "active",
    enum: ["active", "on_leave", "retired"],
  },

  leaveQuota: { type: Number, default: 25 },
  verifyCode: { type: Number, required: false },

  
  shiftCount: {
    weekStart: { type: Date, default: null }, // Tracks the Monday of the week
    count: { type: Number, default: 0 }, // Shifts worked this week
  },

  verifyCode: {
    type: Number,
    required: false, // optional
  },

  qualifications: {
    degree: String,
    institution: String,
    year: Number,
    certifications: {
      certification: String,
    },
  },
})

employeeSchema.pre("save", async function (next) {
  if (!this.image || this.image === "") {
    this.image = "../../uploads/anonyme.jpg"
  }

  if (!this.isModified("password")) {
    return next()
  }

  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
  next()
})

const Employee = mongoose.model("employees", employeeSchema)

module.exports = Employee