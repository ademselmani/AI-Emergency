/** @format */

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import Modal from "../../components/ressourcesComponent/modal"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Room = () => {
  const [rooms, setRooms] = useState([])
  const [areas, setAreas] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    capacity: 0,
    type: "",
    status: "AVAILABLE",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [errors, setErrors] = useState({})

  // Define status colors
  const statusColors = {
    AVAILABLE: { backgroundColor: "#dcfce7", color: "#166534" }, // Green for AVAILABLE
    OCCUPIED: { backgroundColor: "#fee2e2", color: "#991b1b" }, // Red for OCCUPIED
    MAINTENANCE: { backgroundColor: "#fef9c3", color: "#854d0e" }, // Yellow for MAINTENANCE
  }

  useEffect(() => {
    fetchRooms()
    fetchAreas()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rooms")
      setRooms(Array.isArray(response.data) ? response.data : [])
      setLoading(false)
    } catch (err) {
      setError(`Failed to fetch rooms: ${err.message}`)
      setLoading(false)
    }
  }

  const fetchAreas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/areas")
      setAreas(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Failed to fetch areas:", err)
    }
  }

  const handleOpenModal = (room) => {
    if (room) {
      setCurrentRoom(room)
      setFormData({
        name: room.name,
        area: room.area._id,
        capacity: room.capacity,
        type: room.type,
        status: room.status,
      })
    } else {
      setCurrentRoom(null)
      setFormData({
        name: "",
        area: "",
        capacity: 0,
        type: "",
        status: "AVAILABLE",
      })
    }
    setIsModalOpen(true)
    setErrors({}) // Clear errors when opening the modal
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentRoom(null)
    setErrors({}) // Clear errors when closing the modal
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

    try {
      if (currentRoom) {
        // Update existing room
        const response = await axios.put(
          `http://localhost:3000/rooms/${currentRoom._id}`,
          formData
        )
        setRooms(
          rooms.map((room) =>
            room._id === currentRoom._id ? response.data : room
          )
        )
        toast.success("Room updated successfully!")
      } else {
        // Create new room
        const response = await axios.post(
          "http://localhost:3000/rooms",
          formData
        )
        setRooms([...rooms, response.data])
        toast.success("Room created successfully!")
      }
      handleCloseModal()
    } catch (err) {
      if (err.response && err.response.data.errors) {
        // Handle validation errors
        setErrors(err.response.data.errors)
      } else if (err.response && err.response.data.error) {
        // Handle duplicate room name error
        setErrors({ ...errors, name: err.response.data.error })
      } else {
        toast.error(
          `Failed to ${currentRoom ? "update" : "create"} room: ${err.message}`
        )
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/rooms/${id}`)
      setRooms(rooms.filter((room) => room._id !== id))
      toast.success("Room deleted successfully!")
    } catch (err) {
      toast.error(`Failed to delete room: ${err.message}`)
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const areaMatch = selectedArea === "all" || room.area._id === selectedArea
    const statusMatch =
      selectedStatus === "all" || room.status === selectedStatus
    return areaMatch && statusMatch
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

  const roomTypes = ["CONSULTATION", "EMERGENCY", "LABORATORY", "RECOVERY"]
  const roomStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"]

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
          Room Management
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
          <Plus size={18} style={{ marginRight: "8px" }} /> Add Room
        </button>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "16px" }}>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #d1d5db",
          }}
        >
          <option value='all'>All Areas</option>
          {areas.map((area) => (
            <option key={area._id} value={area._id}>
              {area.name}
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
          {roomStatuses.map((status) => (
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
                Area
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
                Capacity
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
                Type
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
            {filteredRooms.map((room) => {
              const statusColor = statusColors[room.status] || {
                backgroundColor: "#d1d5db",
                color: "#1f2937",
              } // Default gray for unknown statuses

              return (
                <tr key={room._id} style={{ backgroundColor: "#fff" }}>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      color: "#1f2937",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {room.name}
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
                    {room.area?.name || "N/A"}
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
                    {room.capacity}
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
                    {room.type}
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
                      {room.status}
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
                      onClick={() => handleOpenModal(room)}
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
                      onClick={() => handleDelete(room._id)}
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
        title={currentRoom ? "Edit Room" : "Add New Room"}
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
              Room Name
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
              htmlFor='area'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Area
            </label>
            <select
              id='area'
              name='area'
              value={formData.area}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.area ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            >
              <option value='' disabled>
                Select an area
              </option>
              {areas.map((area) => (
                <option key={area._id} value={area._id}>
                  {area.name}
                </option>
              ))}
            </select>
            {errors.area && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.area}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='capacity'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Capacity
            </label>
            <input
              type='number'
              id='capacity'
              name='capacity'
              value={formData.capacity}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.capacity
                  ? "1px solid #dc2626"
                  : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            />
            {errors.capacity && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.capacity}
              </div>
            )}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor='type'
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              Type
            </label>
            <select
              id='type'
              name='type'
              value={formData.type}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "8px",
                border: errors.type ? "1px solid #dc2626" : "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            >
              <option value='' disabled>
                Select a type
              </option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.type && (
              <div
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {errors.type}
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
              {roomStatuses.map((status) => (
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
              {currentRoom ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Room
