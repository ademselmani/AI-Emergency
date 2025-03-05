/** @format */

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import Modal from "../../components/ressourcesComponent/modal"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Equipment = () => {
  const [equipments, setEquipments] = useState([])
  const [rooms, setRooms] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentEquipment, setCurrentEquipment] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    room: "",
    status: "AVAILABLE",
    purchaseDate: "",
    lastMaintenanceDate: "",
    nextMaintenanceDate: "",
    manufacturer: "",
    model: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [errors, setErrors] = useState({})

  const statusColors = {
    AVAILABLE: { backgroundColor: "#dcfce7", color: "#166534" },
    IN_USE: { backgroundColor: "#fee2e2", color: "#991b1b" },
    MAINTENANCE: { backgroundColor: "#fef9c3", color: "#854d0e" },
    OUT_OF_ORDER: { backgroundColor: "#d1d5db", color: "#1f2937" },
  }

  useEffect(() => {
    fetchEquipments()
    fetchRooms()
  }, [])

  const fetchEquipments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/equipments")
      setEquipments(Array.isArray(response.data) ? response.data : [])
      setLoading(false)
    } catch (err) {
      setError(`Failed to fetch equipments: ${err.message}`)
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rooms")
      setRooms(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Failed to fetch rooms:", err)
    }
  }

  const handleOpenModal = (equipment) => {
    if (equipment) {
      setCurrentEquipment(equipment)
      const formatDate = (date) =>
        date ? new Date(date).toISOString().split("T")[0] : ""

      setFormData({
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        room: equipment.room._id,
        status: equipment.status,
        purchaseDate: formatDate(equipment.purchaseDate),
        lastMaintenanceDate: formatDate(equipment.lastMaintenanceDate),
        nextMaintenanceDate: formatDate(equipment.nextMaintenanceDate),
        manufacturer: equipment.manufacturer,
        model: equipment.model,
      })
    } else {
      setCurrentEquipment(null)
      setFormData({
        name: "",
        serialNumber: "",
        room: "",
        status: "AVAILABLE",
        purchaseDate: "",
        lastMaintenanceDate: "",
        nextMaintenanceDate: "",
        manufacturer: "",
        model: "",
      })
    }
    setIsModalOpen(true)
    setErrors({})
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentEquipment(null)
    setErrors({})
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset errors
    setErrors({})

    const purchaseDate = formData.purchaseDate
      ? new Date(formData.purchaseDate)
      : null
    const lastMaintenanceDate = formData.lastMaintenanceDate
      ? new Date(formData.lastMaintenanceDate)
      : null
    const nextMaintenanceDate = formData.nextMaintenanceDate
      ? new Date(formData.nextMaintenanceDate)
      : null

    // Validate dates before proceeding
    let validationErrors = {}

    if (
      purchaseDate &&
      lastMaintenanceDate &&
      lastMaintenanceDate < purchaseDate
    ) {
      validationErrors.lastMaintenanceDate =
        "Last maintenance date must be after purchase date"
    }

    if (
      purchaseDate &&
      nextMaintenanceDate &&
      nextMaintenanceDate < purchaseDate
    ) {
      validationErrors.nextMaintenanceDate =
        "Next maintenance date must be after purchase date"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return // Stop submission if there are validation errors
    }

    // Proceed with API call only if validation passes
    try {
      if (currentEquipment) {
        const response = await axios.put(
          `http://localhost:3000/equipments/${currentEquipment._id}`,
          formData
        )
        setEquipments(
          equipments.map((equipment) =>
            equipment._id === currentEquipment._id ? response.data : equipment
          )
        )
        toast.success("Equipment updated successfully!")
      } else {
        const response = await axios.post(
          "http://localhost:3000/equipments",
          formData
        )
        setEquipments([...equipments, response.data])
        toast.success("Equipment created successfully!")
      }
      handleCloseModal()
    } catch (err) {
      if (err.response && err.response.data.error) {
        setErrors({ ...errors, serialNumber: err.response.data.error })
      } else if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors)
      } else {
        toast.error(
          `Failed to ${currentEquipment ? "update" : "create"} equipment: ${
            err.message
          }`
        )
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/equipments/${id}`)
      setEquipments(equipment.filter((equipment) => equipment._id !== id))
      toast.success("Equipment deleted successfully!")
    } catch (err) {
      toast.error(`Failed to delete equipment: ${err.message}`)
    }
  }

  const filteredEquipments = equipments.filter((equipment) => {
    const roomMatch =
      selectedRoom === "all" || equipment.room._id === selectedRoom
    const statusMatch =
      selectedStatus === "all" || equipment.status === selectedStatus
    return roomMatch && statusMatch
  })

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
        Loading...
      </div>
    )
  if (error)
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "#dc2626" }}>
        {error}
      </div>
    )

  const equipmentStatuses = [
    "AVAILABLE",
    "IN_USE",
    "MAINTENANCE",
    "OUT_OF_ORDER",
  ]

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <ToastContainer />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
          Equipment Management
        </h2>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <Plus size={18} style={{ marginRight: "8px" }} /> Add Equipment
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "16px" }}>
        <select
          value={selectedRoom}
          onChange={(e) => setSelectedRoom(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        >
          <option value='all'>All Rooms</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        >
          <option value='all'>All Statuses</option>
          {equipmentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontWeight: "500",
                  backgroundColor: "#f9fafb",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontWeight: "500",
                  backgroundColor: "#f9fafb",
                }}
              >
                Serial Number
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontWeight: "500",
                  backgroundColor: "#f9fafb",
                }}
              >
                Room
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontWeight: "500",
                  backgroundColor: "#f9fafb",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  fontWeight: "500",
                  backgroundColor: "#f9fafb",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipments.map((equipment) => {
              const statusColor = statusColors[equipment.status] || {
                backgroundColor: "#d1d5db",
                color: "#1f2937",
              }

              return (
                <tr key={equipment._id} style={{ backgroundColor: "#fff" }}>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#1f2937",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {equipment.name}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#1f2937",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {equipment.serialNumber}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#1f2937",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {equipment.room?.name || "N/A"}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#1f2937",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        backgroundColor: statusColor.backgroundColor,
                        color: statusColor.color,
                        fontWeight: "500",
                      }}
                    >
                      {equipment.status}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#1f2937",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      onClick={() => handleOpenModal(equipment)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      <Edit size={18} color='#3b82f6' />
                    </button>
                    <button
                      onClick={() => handleDelete(equipment._id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={18} color='#ef4444' />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentEquipment ? "Edit Equipment" : "Add New Equipment"}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='name'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.name ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            />
            {errors.name && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.name}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='serialNumber'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Serial Number
            </label>
            <input
              type='text'
              id='serialNumber'
              name='serialNumber'
              value={formData.serialNumber}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.serialNumber
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            />
            {errors.serialNumber && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.serialNumber}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='room'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Room
            </label>
            <select
              id='room'
              name='room'
              value={formData.room}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.room ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            >
              <option value='' disabled>
                Select a room
              </option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>
            {errors.room && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.room}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='status'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Status
            </label>
            <select
              id='status'
              name='status'
              value={formData.status}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.status
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            >
              {equipmentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {errors.status && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.status}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='purchaseDate'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Purchase Date
            </label>
            <input
              type='date'
              id='purchaseDate'
              name='purchaseDate'
              value={formData.purchaseDate}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.purchaseDate
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {errors.purchaseDate && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.purchaseDate}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='lastMaintenanceDate'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Last Maintenance Date
            </label>
            <input
              type='date'
              id='lastMaintenanceDate'
              name='lastMaintenanceDate'
              value={formData.lastMaintenanceDate}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.lastMaintenanceDate
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {errors.lastMaintenanceDate && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.lastMaintenanceDate}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='nextMaintenanceDate'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Next Maintenance Date
            </label>
            <input
              type='date'
              id='nextMaintenanceDate'
              name='nextMaintenanceDate'
              value={formData.nextMaintenanceDate}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.nextMaintenanceDate
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {errors.nextMaintenanceDate && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.nextMaintenanceDate}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='manufacturer'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Manufacturer
            </label>
            <input
              type='text'
              id='manufacturer'
              name='manufacturer'
              value={formData.manufacturer}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.manufacturer
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {errors.manufacturer && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.manufacturer}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='model'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Model
            </label>
            <input
              type='text'
              id='model'
              name='model'
              value={formData.model}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.model
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {errors.model && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.model}
              </div>
            )}
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
          >
            <button
              type='button'
              onClick={handleCloseModal}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                backgroundColor: "#fff",
                color: "#1f2937",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {currentEquipment ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Equipment
