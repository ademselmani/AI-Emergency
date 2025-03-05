const express = require("express")
const router = express.Router()
const {
  createEquipment,
  getEquipments,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
} = require("../controllers/equipment.controller")

router.post("/", createEquipment)
router.get("/", getEquipments)
router.get("/:id", getEquipmentById)
router.put("/:id", updateEquipment)
router.delete("/:id", deleteEquipment)

module.exports = router
