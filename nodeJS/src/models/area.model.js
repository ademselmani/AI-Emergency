const mongoose = require("mongoose")

// Area Model
const AreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique : true,
      required: true,
      enum: [
        "TRIAGE",
        "RESUSCITATION_AREA",
        "MAJOR_TRAUMA",
        "CONSULTATION",
        "OBSERVATION_UNIT",
      ],
    },
    description: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)
module.exports = mongoose.model("Area", AreaSchema)
