const Room = require("../models/room.model")
const Area = require("../models/area.model")

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { area, ...rest } = req.body

    // Validate area ID
    const validArea = await Area.findById(area)
    if (!validArea) {
      return res.status(400).json({ message: "Invalid area ID" })
    }

    // Create and save the room
    const room = new Room({ ...rest, area })
    const savedRoom = await room.save()

    // Populate the area field in the response
    const populatedRoom = await Room.findById(savedRoom._id).populate("area")

    res.status(201).json(populatedRoom)
  } catch (err) {
    if (err.name === "ValidationError") {
      // Handle Mongoose validation errors
      const errors = {}
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message
      })
      res.status(400).json({ errors })
    } else if (err.code === 11000) {
      // Handle duplicate key error (e.g., duplicate room name)
      res.status(400).json({ error: "Room name must be unique." })
    } else {
      res.status(400).json({ error: err.message })
    }
  }
}
// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("area")
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get a single room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("area")
    if (!room) return res.status(404).json({ message: "Room not found" })
    res.json(room)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update a room
exports.updateRoom = async (req, res) => {
  try {
    const { area, ...rest } = req.body

    // Validate area ID if provided
    if (area) {
      const validArea = await Area.findById(area)
      if (!validArea) {
        return res.status(400).json({ message: "Invalid area ID" })
      }
    }

    // Update the room and populate the area field
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { ...rest, area },
      { new: true, runValidators: true }
    ).populate("area")

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.json(room)
  } catch (err) {
    if (err.name === "ValidationError") {
      // Handle Mongoose validation errors
      const errors = {}
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message
      })
      res.status(400).json({ errors })
    } else if (err.code === 11000) {
      // Handle duplicate key error (e.g., duplicate room name)
      res.status(400).json({ error: "Room name must be unique." })
    } else {
      res.status(400).json({ error: err.message })
    }
  }
}
// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)
    if (!room) return res.status(404).json({ message: "Room not found" })
    res.json({ message: "Room deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
