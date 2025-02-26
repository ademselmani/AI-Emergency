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
  qualifications: {
    degree: String,
    institution: String,
    year: Number,
    certifications: {
      certification: String,
    },
  },
});

// employeeSchema.pre(
//   'save',
//   async function(next) {
//     // this refers to the current document about to be saved.
//     const empl = this;
//     const hash = await bcrypt.hash(this.password, 10);

//     this.password = hash;
//     next();
//   }
// );

employeeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

// employeeSchema.methods.isValidPassword = async function(password) {
//   const user = this;
//   const compare = await bcrypt.compare(password, user.password);

//   return compare;
// }

const Employee = mongoose.model("employees", employeeSchema);

module.exports = Employee;
