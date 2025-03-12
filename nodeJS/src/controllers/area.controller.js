const Area = require("../models/area.model")

// Create a new area
exports.createArea = async (req, res) => {
  try {
    const area = new Area(req.body)
    const savedArea = await area.save()
    res.status(201).json(savedArea)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get all areas
exports.getAreas = async (req, res) => {
  try {
    const areas = await Area.find()
    res.json(areas)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get a single area
exports.getAreaById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id)
    if (!area) return res.status(404).json({ message: "Area not found" })
    res.json(area)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update an area
exports.updateArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!area) return res.status(404).json({ message: "Area not found" })
    res.json(area)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Delete an area
exports.deleteArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndDelete(req.params.id)
    if (!area) return res.status(404).json({ message: "Area not found" })
    res.json({ message: "Area deleted" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
