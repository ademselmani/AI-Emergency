/** @format */

const express = require("express")
const router = express.Router()
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require("../controllers/room.controller")

router.post("/", createRoom)
router.get("/", getRooms)
router.get("/:id", getRoomById)
router.put("/:id", updateRoom)
router.delete("/:id", deleteRoom)

module.exports = router
