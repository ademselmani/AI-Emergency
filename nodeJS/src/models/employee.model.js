const mongoose = require("mongoose");
const bcrypt = require('bcrypt');


const employeeSchema = mongoose.Schema({
  cin: Number,
  name: String,
  familyName: String,
  image : String,
  birthday: Date,
  gender: String,
  phone: String,
  imagePath: { type: String, required: false }, // Le chemin du fichier image stocké
  faceDescriptor: { type: [Number], required: false }, // Descripteur facial
  role: {
    type: String,
    enum: [
      "admin",
      "doctor",
      "nurse",
      "triage_nurse",
      "receptionnist",
      "ambulance_driver",
    ],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: { type: String, default: "" },
  joinDate: Date,
  adresse: String,

  status: {
    type: String,
    enum: ["active", "on_leave", "retired"],
  },
  leaveQuota: { type: Number, default: 25 },
  qualifications: {
    degree: String,
    institution: String,
    year: Number,
    certifications: {
      certification: String,
    },
  },
});



employeeSchema.pre("save", async function (next) {
  if(!this.image === ""  || this.image === null) this.image = "../../uploads/anonyme.jpg"
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});



const Employee = mongoose.model("employees", employeeSchema);

module.exports = Employee;
