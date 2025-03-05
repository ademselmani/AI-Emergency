/** @format */

const mongoose = require("mongoose")

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      unique: true, 
      minlength: [2, "Room name must be at least 2 characters long"],
      maxlength: [100, "Room name cannot exceed 100 characters"],
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: [true, "Area is required"],
    },
    capacity: {
      type: Number,
      default: 0,
      min: [0, "Capacity cannot be negative"],
    },
    type: {
      type: String,
      enum: {
        values: ["CONSULTATION", "EMERGENCY", "LABORATORY", "RECOVERY"],
        message: "{VALUE} is not a valid room type",
      },
      required: [true, "Room type is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["AVAILABLE", "OCCUPIED", "MAINTENANCE"],
        message: "{VALUE} is not a valid status",
      },
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Room", RoomSchema)
