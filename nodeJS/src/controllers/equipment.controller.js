/** @format */

const Equipment = require("../models/equipment.model")
const Room = require("../models/room.model")

// Create new equipment
exports.createEquipment = async (req, res) => {
  try {
    const { room, ...rest } = req.body

    const equipment = new Equipment({
      ...rest,
      room,
    })

    const savedEquipment = await equipment.save()
    const populatedEquipment = await Equipment.findById(
      savedEquipment._id
    ).populate("room")

    res.status(201).json(populatedEquipment)
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {}
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message
      })
      res.status(400).json({ errors })
    } else if (err.code === 11000) {
      res.status(400).json({
        error:
          "This serial number is already in use. Please enter a unique serial number.",
      })
    } else {
      res.status(400).json({ error: err.message })
    }
  }
}
// Get all equipments
exports.getEquipments = async (req, res) => {
  try {
    const equipments = await Equipment.find().populate("room")
    res.json(equipments)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get a single equipment
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate("room")
    if (!equipment)
      return res.status(404).json({ message: "Equipment not found" })
    res.json(equipment)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update equipment
exports.updateEquipment = async (req, res) => {
  try {
    const { room, ...rest } = req.body

    // Date validation BEFORE updating
    const purchaseDate = rest.purchaseDate ? new Date(rest.purchaseDate) : null
    const lastMaintenanceDate = rest.lastMaintenanceDate
      ? new Date(rest.lastMaintenanceDate)
      : null
    const nextMaintenanceDate = rest.nextMaintenanceDate
      ? new Date(rest.nextMaintenanceDate)
      : null

    if (
      purchaseDate &&
      lastMaintenanceDate &&
      lastMaintenanceDate < purchaseDate
    ) {
      return res.status(400).json({
        errors: {
          lastMaintenanceDate:
            "Last maintenance date must be after purchase date",
        },
      })
    }

    if (
      purchaseDate &&
      nextMaintenanceDate &&
      nextMaintenanceDate < purchaseDate
    ) {
      return res.status(400).json({
        errors: {
          nextMaintenanceDate:
            "Next maintenance date must be after purchase date",
        },
      })
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { ...rest, room },
      { new: true, runValidators: true }
    ).populate("room")

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" })
    }

    res.json(equipment)
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = {}
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message
      })
      res.status(400).json({ errors })
    } else if (err.code === 11000) {
      res.status(400).json({
        error:
          "This serial number is already in use. Please enter a unique serial number.",
      })
    } else {
      res.status(400).json({ error: err.message })
    }
  }
}

// Delete equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id)
    if (!equipment)
      return res.status(404).json({ message: "Equipment not found" })
    res.json({ message: "Equipment deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
