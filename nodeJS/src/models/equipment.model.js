/** @format */

const mongoose = require("mongoose")

const EquipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    serialNumber: {
      type: String,
      required: [true, "Serial number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[A-Za-z0-9]{6,20}$/.test(v)
        },
        message: (props) =>
          `${props.value} is not a valid serial number! It must be 6-20 alphanumeric characters.`,
      },
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_ORDER"],
        message: "{VALUE} is not a valid status",
      },
      default: "AVAILABLE",
    },
    purchaseDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v <= new Date()
        },
        message: (props) =>
          `Purchase date (${props.value}) cannot be in the future.`,
      },
    },
    lastMaintenanceDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true // Optional field
          if (this.purchaseDate) {
            return v >= this.purchaseDate
          }
          return true // No purchase date, no restriction
        },
        message: (props) =>
          `Last maintenance date (${props.value}) must be after purchase date.`,
      },
    },
    nextMaintenanceDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true // Optional field
          const isValid = v > new Date()
          if (this.lastMaintenanceDate) {
            return v > this.lastMaintenanceDate && isValid
          }
          return isValid
        },
        message: (props) =>
          `Next maintenance date (${props.value}) must be in the future and after last maintenance date.`,
      },
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ["maintenance"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastNotified: {
      type: Date,
      default: null,
    },
    manufacturer: {
      type: String,
      trim: true,
      maxlength: [100, "Manufacturer name cannot exceed 100 characters"],
    },
    model: {
      type: String,
      trim: true,
      maxlength: [100, "Model name cannot exceed 100 characters"],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Equipment", EquipmentSchema)
