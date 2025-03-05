const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const employeeSchema = mongoose.Schema({
  cin: {
    type: Number,
    required: true,
    unique: true,
    min: 10000000, // Assuming a minimum 8-digit CIN
    max: 99999999, // Assuming a maximum 8-digit CIN
    validate: {
      validator: Number.isInteger,
      message: "CIN must be an integer",
    },
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"],
    match: [
      /^[a-zA-Z\s-]+$/,
      "Name can only contain letters, spaces, and hyphens",
    ],
  },
  familyName: {
    type: String,
    required: [true, "Family name is required"],
    trim: true,
    minlength: [2, "Family name must be at least 2 characters long"],
    maxlength: [50, "Family name cannot exceed 50 characters"],
    match: [
      /^[a-zA-Z\s-]+$/,
      "Family name can only contain letters, spaces, and hyphens",
    ],
  },
  image: {
    type: String,
    default:
      "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
  },
  birthday: {
    type: Date,
    required: [true, "Birthday is required"],
    validate: {
      validator: function (value) {
        return value <= new Date() // Ensure birthday is not in the future
      },
      message: "Birthday cannot be in the future",
    },
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
    enum: {
      values: ["Male", "Female"],
      message: "Gender must be either 'Male' or 'Female'",
    },
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [
      /^\+?[1-9]\d{9,14}$/,
      "Phone number must be a valid international format (e.g., +1234567890)",
    ],
  },
  imagePath: { type: String, required: false }, // Le chemin du fichier image stocké
  faceDescriptor: { type: [Number], required: false }, // Descripteur facial
  role: {
    type: String,
    enum: {
      values: [
        "admin",
        "doctor",
        "nurse",
        "triage_nurse",
        "receptionnist",
        "ambulance_driver",
      ],
      message:
        "Role must be one of: admin, doctor, nurse, triage_nurse, receptionnist, ambulance_driver",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Email must be a valid address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  resetToken: { type: String, default: "" },
  joinDate: {
    type: Date,
    required: [true, "Join date is required"],
    validate: {
      validator: function (value) {
        return value <= new Date() // Ensure join date is not in the future
      },
      message: "Join date cannot be in the future",
    },
  },
  adresse: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    minlength: [5, "Address must be at least 5 characters long"],
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  status: {
    type: String,
    enum: {
      values: ["active", "on_leave", "retired"],
      message: "Status must be either 'active', 'on_leave', or 'retired'",
    },
    default: "active",
  },
  qualifications: {
    degree: {
      type: String,
      trim: true,
      maxlength: [100, "Degree cannot exceed 100 characters"],
    },
    institution: {
      type: String,
      trim: true,
      maxlength: [100, "Institution cannot exceed 100 characters"],
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(), // Current year
      validate: {
        validator: Number.isInteger,
        message: "Year must be an integer",
      },
    },
    certifications: {
      certification: {
        type: String,
        trim: true,
        maxlength: [100, "Certification cannot exceed 100 characters"],
      },
    },
  },
})

employeeSchema.pre("save", async function (next) {
  // Fix image default logic
  if (!this.image || this.image === "") {
    this.image = "../../uploads/anonyme.jpg"
  }

  if (!this.isModified("password")) {
    return next()
  }

  try {
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash
    next()
  } catch (error) {
    next(error)
  }
})

// Uncomment and use if needed for password validation
// employeeSchema.methods.isValidPassword = async function (password) {
//   const user = this;
//   const compare = await bcrypt.compare(password, user.password);
//   return compare;
// };

const Employee = mongoose.model("employees", employeeSchema)

module.exports = Employee
