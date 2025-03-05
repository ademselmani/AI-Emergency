/** @format */

const express = require("express")
const router = express.Router()
const {
  createArea,
  getAreas,
  getAreaById,
  updateArea,
  deleteArea,
} = require("../controllers/area.controller")

router.post("/", createArea)
router.get("/", getAreas)
router.get("/:id", getAreaById)
router.put("/:id", updateArea)
router.delete("/:id", deleteArea)

module.exports = router
