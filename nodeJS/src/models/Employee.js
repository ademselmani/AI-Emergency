const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = mongoose.Schema({
  cin: Number,
  name: String,
  familyName: String,
  image : String,
  birthday: Date,
  gender: String,
  phone: String,
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

employeeSchema.pre(
  'save',
  async function(next) {
    // this refers to the current document about to be saved.
    const empl = this;
    const hash = await bcrypt.hash(this.password, 10);

    this.password = hash;
    next();
  }
);

employeeSchema.methods.isValidPassword = async function(password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);

  return compare;
}

const Employee = mongoose.model("employees", employeeSchema);
module.exports = Employee;
