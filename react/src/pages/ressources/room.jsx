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

  const statusColors = {
    AVAILABLE: { backgroundColor: "#dcfce7", color: "#166534" },
    OCCUPIED: { backgroundColor: "#fee2e2", color: "#991b1b" },
    MAINTENANCE: { backgroundColor: "#fef9c3", color: "#854d0e" },
  }

  const statusIcons = {
    AVAILABLE: <CheckCircle size={16} />,
    OCCUPIED: <Users size={16} />,
    MAINTENANCE: <Wrench size={16} />,
  }

  const areaColors = {
    TRIAGE: "#f87171",
    RESUSCITATION_AREA: "#fb923c",
    MAJOR_TRAUMA: "#facc15",
    CONSULTATION: "#34d399",
    OBSERVATION_UNIT: "#60a5fa",
  }

  useEffect(() => {
    fetchRooms()
    fetchAreas()
  }, [])

  useEffect(() => {
    console.log("formData updated:", formData) // Log formData changes
  }, [formData])

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

  const resetFormData = useCallback(() => {
    return {
      name: "",
      area: "",
      capacity: 0,
      type: "",
      status: "AVAILABLE",
    }
  }, [])

  const handleOpenModal = useCallback(
    (room) => {
      console.log("Opening modal, room:", room)
      if (room) {
        setCurrentRoom(room)
        setFormData({
          name: room.name || "",
          area: room.area._id || "",
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
      console.log("formData after reset:", { ...formData }) // Log current state after reset
    },
    [resetFormData]
  )

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setCurrentRoom(null)
    setFormData(resetFormData())
    setErrors({})
    console.log("Modal closed, formData reset to:", resetFormData())
  }, [resetFormData])

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/rooms/${id}`)
      setRooms(rooms.filter((room) => room._id !== id))
      toast.success("Room deleted successfully!")
    } catch (err) {
      toast.error(`Failed to delete room: ${err.message}`)
    }
  }

  const filteredRooms =
    selectedArea === "all"
      ? rooms
      : rooms.filter((room) => room.area._id === selectedArea)

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

      <div style={{ marginBottom: "20px" }}>
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
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {areas.map((area) => {
          const areaRooms = filteredRooms.filter(
            (room) => room.area._id === area._id
          )
          if (selectedArea !== "all" && selectedArea !== area._id) return null

          return (
            <div
              key={area._id}
              style={{
                flex: "1 1 300px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "16px",
                border: `2px solid ${areaColors[area.name] || "#d1d5db"}`,
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: areaColors[area.name] || "#1f2937",
                  marginBottom: "12px",
                }}
              >
                {area.name}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
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
                        width: "200px",
                        padding: "12px",
                        borderRadius: "8px",
                        backgroundColor: statusColor.backgroundColor,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        position: "relative",
                        border: `1px solid ${statusColor.color}`,
                      }}
                      onClick={() => handleOpenModal(room)}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
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
                            fontSize: "14px",
                            fontWeight: "500",
                            color: statusColor.color,
                          }}
                        >
                          {room.name}
                        </div>
                      </div>
                      <div
                        style={{ fontSize: "12px", color: statusColor.color }}
                      >
                        Type: {room.type}
                      </div>
                      <div
                        style={{ fontSize: "12px", color: statusColor.color }}
                      >
                        Capacity: {room.capacity}
                      </div>
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "4px 8px",
                          backgroundColor: `${statusColor.color}20`,
                          color: statusColor.color,
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          textAlign: "center",
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
                          top: "8px",
                          right: "8px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} color='#ef4444' />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        key={`${isModalOpen}-${JSON.stringify(formData)}`} // Unique key based on formData
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
