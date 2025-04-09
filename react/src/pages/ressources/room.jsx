/** @format */

import React, { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, CheckCircle, Wrench, Users } from "lucide-react"
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
  const [errors, setErrors] = useState({})

  // Status styling for rooms
  const statusColors = {
    AVAILABLE: { backgroundColor: "#e7f7e9", color: "#2f855a" }, // Softer green
    OCCUPIED: { backgroundColor: "#fee2e2", color: "#b91c1c" }, // Softer red
    MAINTENANCE: { backgroundColor: "#fef9c3", color: "#a16207" }, // Softer yellow
  }

  const statusIcons = {
    AVAILABLE: <CheckCircle size={16} />,
    OCCUPIED: <Users size={16} />,
    MAINTENANCE: <Wrench size={16} />,
  }

  // Area colors for visual distinction
  const areaColors = {
    TRIAGE: "#f87171",
    RESUSCITATION_AREA: "#fb923c",
    MAJOR_TRAUMA: "#facc15",
    CONSULTATION: "#34d399",
    OBSERVATION_UNIT: "#60a5fa",
  }

  // Fetch rooms and areas on component mount
  useEffect(() => {
    fetchRooms()
    fetchAreas()
  }, [])

  // Log formData changes for debugging
  useEffect(() => {
    console.log("formData updated:", formData)
  }, [formData])

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rooms")
      console.log("Fetched rooms:", response.data)
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
      console.log("Fetched areas:", response.data)
      setAreas(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error("Failed to fetch areas:", err)
    }
  }

  // Reset form data to default values
  const resetFormData = useCallback(() => {
    return {
      name: "",
      area: "",
      capacity: 0,
      type: "",
      status: "AVAILABLE",
    }
  }, [])

  // Open modal for adding/editing a room
  const handleOpenModal = useCallback(
    (room) => {
      console.log("Opening modal, room:", room)
      if (room) {
        setCurrentRoom(room)
        setFormData({
          name: room.name || "",
          area: room.area?._id || "",
          capacity: room.capacity || 0,
          type: room.type || "",
          status: room.status || "AVAILABLE",
        })
      } else {
        setCurrentRoom(null)
        setFormData(resetFormData())
      }
      setIsModalOpen(true)
      setErrors({})
      console.log("formData after reset:", { ...formData })
    },
    [resetFormData]
  )

  // Close modal and reset form
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setCurrentRoom(null)
    setFormData(resetFormData())
    setErrors({})
    console.log("Modal closed, formData reset to:", resetFormData())
  }, [resetFormData])

  // Handle form submission for creating/updating a room
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const requiredFields = ["name", "area", "capacity", "type", "status"]
    const missingFields = requiredFields.filter(
      (field) =>
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
    )
    if (missingFields.length > 0) {
      setErrors({
        general: `Missing required fields: ${missingFields.join(", ")}`,
      })
      console.log("Validation failed, missing fields:", missingFields)
      return
    }

    if (formData.capacity < 0) {
      setErrors({ capacity: "Capacity cannot be negative" })
      return
    }

    console.log("Submitting formData:", formData)
    try {
      if (currentRoom) {
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
        const response = await axios.post(
          "http://localhost:3000/rooms",
          formData
        )
        setRooms([...rooms, response.data])
        toast.success("Room created successfully!")
      }
      handleCloseModal()
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors)
      } else if (err.response && err.response.data.error) {
        setErrors({ name: err.response.data.error })
      } else {
        toast.error(
          `Failed to ${currentRoom ? "update" : "create"} room: ${err.message}`
        )
      }
    }
  }

  // Delete a room
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/rooms/${id}`)
      setRooms(rooms.filter((room) => room._id !== id))
      toast.success("Room deleted successfully!")
    } catch (err) {
      toast.error(`Failed to delete room: ${err.message}`)
    }
  }

  // Filter rooms based on selected area (with safety check for room.area)
  const filteredRooms =
    selectedArea === "all"
      ? rooms
      : rooms.filter((room) => room.area?._id === selectedArea)

  // Loading and error states
  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#6b7280",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        Loading...
      </div>
    )
  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#dc2626",
          fontSize: "18px",
          fontWeight: "500",
        }}
      >
        {error}
      </div>
    )

  // Room types and statuses for form dropdowns
  const roomTypes = ["CONSULTATION", "EMERGENCY", "LABORATORY", "RECOVERY"]
  const roomStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE"]

  // Form fields configuration for the modal
  const roomFields = [
    {
      name: "name",
      label: "Room Name",
      type: "text",
      placeholder: "Enter room name",
      required: true,
    },
    {
      name: "area",
      label: "Area",
      type: "select",
      options: areas.map((area) => ({ value: area._id, label: area.name })),
      placeholder: "Select an area",
      required: true,
    },
    {
      name: "capacity",
      label: "Capacity",
      type: "number",
      placeholder: "Enter capacity",
      required: true,
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      optionValues: roomTypes,
      placeholder: "Select Type",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      optionValues: roomStatuses,
      placeholder: "Select a status",
      required: true,
    },
  ]

  return (
    <div
      style={{
        padding: "30px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)", // Subtle gradient background
        minHeight: "100vh",
      }}
    >
      <ToastContainer />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1f2937",
            letterSpacing: "-0.5px",
          }}
        >
          Room Management
        </h2>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "500",
            transition: "background-color 0.3s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#3b82f6")
          }
        >
          <Plus size={20} style={{ marginRight: "8px" }} /> Add Room
        </button>
      </div>

      {/* Area filter dropdown */}
      <div style={{ marginBottom: "30px", maxWidth: "300px" }}>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            backgroundColor: "#fff",
            fontSize: "16px",
            color: "#1f2937",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
        >
          <option value='all'>All Areas</option>
          {areas.map((area) => (
            <option key={area._id} value={area._id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* Render areas and their rooms vertically */}
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {areas.map((area) => {
          const areaRooms = filteredRooms.filter(
            (room) => room.area?._id === area._id
          )
          if (selectedArea !== "all" && selectedArea !== area._id) return null

          return (
            <div
              key={area._id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "20px",
                borderLeft: `4px solid ${areaColors[area.name] || "#d1d5db"}`, // Colored left border
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                width: "100%",
                maxWidth: "800px", // Wider for better readability
                margin: "0 auto",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: areaColors[area.name] || "#1f2937",
                  marginBottom: "16px",
                  letterSpacing: "-0.3px",
                }}
              >
                {area.name}
              </h3>
              {areaRooms.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "15px",
                  }}
                >
                  {areaRooms.map((room) => {
                    const statusColor = statusColors[room.status] || {
                      backgroundColor: "#d1d5db",
                      color: "#1f2937",
                    }
                    const statusIcon = statusIcons[room.status] || null

                    return (
                      <div
                        key={room._id}
                        style={{
                          width: "220px",
                          padding: "15px",
                          borderRadius: "8px",
                          backgroundColor: statusColor.backgroundColor,
                          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
                          cursor: "pointer",
                          position: "relative",
                          border: `1px solid ${statusColor.color}30`,
                          transition:
                            "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onClick={() => handleOpenModal(room)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.02)"
                          e.currentTarget.style.boxShadow =
                            "0 6px 12px rgba(0, 0, 0, 0.15)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)"
                          e.currentTarget.style.boxShadow =
                            "0 3px 6px rgba(0, 0, 0, 0.1)"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{
                              marginRight: "8px",
                              color: statusColor.color,
                            }}
                          >
                            {statusIcon}
                          </span>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: statusColor.color,
                            }}
                          >
                            {room.name}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: statusColor.color,
                            marginBottom: "4px",
                          }}
                        >
                          Type: {room.type}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: statusColor.color,
                            marginBottom: "8px",
                          }}
                        >
                          Capacity: {room.capacity}
                        </div>
                        <div
                          style={{
                            padding: "4px 10px",
                            backgroundColor: `${statusColor.color}20`,
                            color: statusColor.color,
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            textAlign: "center",
                            display: "inline-block",
                          }}
                        >
                          {room.status}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(room._id)
                          }}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            opacity: 0.7,
                            transition: "opacity 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.opacity = "1")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.opacity = "0.7")
                          }
                        >
                          <Trash2 size={16} color='#ef4444' />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#6b7280",
                    fontStyle: "italic",
                  }}
                >
                  No rooms available in this area.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal for adding/editing rooms */}
      <Modal
        key={currentRoom?._id || "new-room"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentRoom ? "Edit Room" : "Add New Room"}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        errors={errors}
        fields={roomFields}
      />
    </div>
  )
}

export default Room
