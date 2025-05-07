/** @format */

import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import {
  Plus,
  Trash2,
  CheckCircle,
  Wrench,
  Users,
  XCircle,
  Pencil,
  AlertCircle,
} from "lucide-react"
import Modal from "../../components/ressourcesComponent/modal"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Tooltip } from "react-tooltip"
import "react-tooltip/dist/react-tooltip.css"
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import socket from "../../components/ressourcesComponent/socket"

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
  const [activeId, setActiveId] = useState(null)
  const [sendingReminder, setSendingReminder] = useState({})

  const statusColors = {
    AVAILABLE: { backgroundColor: "#dcfce7", color: "#166534" },
    IN_USE: { backgroundColor: "#fee2e2", color: "#991b1b" },
    MAINTENANCE: { backgroundColor: "#fef9c3", color: "#854d0e" },
    OUT_OF_ORDER: { backgroundColor: "#d1d5db", color: "#1f2937" },
  }

  const statusIcons = {
    AVAILABLE: <CheckCircle size={16} />,
    IN_USE: <Users size={16} />,
    MAINTENANCE: <Wrench size={16} />,
    OUT_OF_ORDER: <XCircle size={16} />,
  }

  const equipmentStatuses = [
    "AVAILABLE",
    "IN_USE",
    "MAINTENANCE",
    "OUT_OF_ORDER",
  ]

  useEffect(() => {
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

    fetchEquipments()
    fetchRooms()

    // Listen for WebSocket events
    socket.on("equipmentUpdate", (updatedEquipment) => {
      console.log("Received equipment update:", updatedEquipment)
      setEquipments((prevEquipments) =>
        prevEquipments.map((eq) =>
          eq._id === updatedEquipment._id ? updatedEquipment : eq
        )
      )
    })

    socket.on("maintenanceNotification", (notification) => {
      console.log("Maintenance notification received:", notification)
      if (notification.error) {
        toast.error(
          `Failed to send maintenance reminder for equipment ${notification.equipmentId}: ${notification.error}`
        )
      } else {
        toast.info(
          `Maintenance reminder sent for equipment ${notification.equipmentId}: ${notification.message}`
        )
      }
    })

    // Clean up WebSocket listeners on unmount
    return () => {
      socket.off("equipmentUpdate")
      socket.off("maintenanceNotification")
    }
  }, [])

  const handleOpenModal = (equipment) => {
    console.log("Opening modal for equipment:", equipment)
    if (equipment) {
      setCurrentEquipment(equipment)
      const formatDate = (date) =>
        date ? new Date(date).toISOString().split("T")[0] : ""
      const newFormData = {
        name: equipment.name || "",
        serialNumber: equipment.serialNumber || "",
        room: equipment.room?._id || "",
        status: equipment.status || "AVAILABLE",
        purchaseDate: formatDate(equipment.purchaseDate) || "",
        lastMaintenanceDate: formatDate(equipment.lastMaintenanceDate) || "",
        nextMaintenanceDate: formatDate(equipment.nextMaintenanceDate) || "",
        manufacturer: equipment.manufacturer || "",
        model: equipment.model || "",
      }
      console.log("Setting formData:", newFormData)
      setFormData(newFormData)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const purchaseDate = formData.purchaseDate
      ? new Date(formData.purchaseDate).toISOString()
      : null
    const lastMaintenanceDate = formData.lastMaintenanceDate
      ? new Date(formData.lastMaintenanceDate).toISOString()
      : null
    const nextMaintenanceDate = formData.nextMaintenanceDate
      ? new Date(formData.nextMaintenanceDate).toISOString()
      : null

    let validationErrors = {}
    if (
      purchaseDate &&
      lastMaintenanceDate &&
      new Date(lastMaintenanceDate) < new Date(purchaseDate)
    ) {
      validationErrors.lastMaintenanceDate =
        "Last maintenance date must be after purchase date"
    }
    if (
      purchaseDate &&
      nextMaintenanceDate &&
      new Date(nextMaintenanceDate) < new Date(purchaseDate)
    ) {
      validationErrors.nextMaintenanceDate =
        "Next maintenance date must be after purchase date"
    }
    if (
      lastMaintenanceDate &&
      nextMaintenanceDate &&
      new Date(nextMaintenanceDate) <= new Date(lastMaintenanceDate)
    ) {
      validationErrors.nextMaintenanceDate =
        "Next maintenance date must be after last maintenance date"
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const requiredFields = ["name", "serialNumber", "room"]
    const missingFields = requiredFields.filter((field) => !formData[field])
    if (missingFields.length > 0) {
      setErrors({
        ...errors,
        general: `Missing required fields: ${missingFields.join(", ")}`,
      })
      return
    }

    const submissionData = {
      ...formData,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate,
    }

    console.log("Submitting formData:", submissionData)

    try {
      if (currentEquipment) {
        const response = await axios.put(
          `http://localhost:3000/equipments/${currentEquipment._id}`,
          submissionData
        )
        setEquipments(
          equipments.map((eq) =>
            eq._id === currentEquipment._id ? response.data : eq
          )
        )
        toast.success("Equipment updated successfully!")
        socket.emit("equipmentUpdate", response.data)
      } else {
        const response = await axios.post(
          "http://localhost:3000/equipments",
          submissionData
        )
        setEquipments([...equipments, response.data])
        toast.success("Equipment created successfully!")
        socket.emit("equipmentUpdate", response.data)
      }
      handleCloseModal()
    } catch (err) {
      console.error("Error in handleSubmit:", err)
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
    const equipmentToDelete = equipments.find((eq) => eq._id === id) || {
      name: "Unknown",
    }
    const confirmDelete = window.confirm(
      `⚠️ Warning: You are about to permanently delete the equipment "${equipmentToDelete.name}".\n\n` +
        `This action will remove all associated records and cannot be undone. Are you sure you want to proceed?`
    )
    if (!confirmDelete) return

    try {
      await axios.delete(`http://localhost:3000/equipments/${id}`)
      setEquipments(equipments.filter((eq) => eq._id !== id))
      toast.success("Equipment deleted successfully!")
      socket.emit("equipmentUpdate", { _id: id, deleted: true })
    } catch (err) {
      toast.error(`Failed to delete equipment: ${err.message}`)
    }
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    setActiveId(null)

    if (!over || active.id === over.id) return

    const draggedEquipment = equipments.find((eq) => eq._id === active.id)
    const newStatus = over.id

    console.log("Drag End:", {
      activeId: active.id,
      overId: over.id,
      newStatus,
      draggedEquipment,
    })

    if (draggedEquipment.status === newStatus) return

    const updatedEquipments = equipments.map((eq) =>
      eq._id === draggedEquipment._id ? { ...eq, status: newStatus } : eq
    )
    setEquipments(updatedEquipments)
    setSelectedStatus("all")

    try {
      const response = await axios.put(
        `http://localhost:3000/equipments/${draggedEquipment._id}`,
        {
          ...draggedEquipment,
          status: newStatus,
        }
      )
      toast.success(`Moved ${draggedEquipment.name} to ${newStatus}`)
      socket.emit("equipmentUpdate", response.data)
    } catch (err) {
      setEquipments(equipments)
      toast.error(`Failed to update status: ${err.message}`)
    }
  }

  const filteredEquipments = equipments.filter((equipment) => {
    const roomMatch =
      selectedRoom === "all" ||
      (equipment.room && equipment.room._id === selectedRoom)
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

  const equipmentFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter equipment name",
      required: true,
    },
    {
      name: "serialNumber",
      label: "Serial Number",
      type: "text",
      placeholder: "Enter serial number (6-20 alphanumeric)",
      required: true,
    },
    {
      name: "room",
      label: "Room",
      type: "select",
      options: rooms.map((room) => ({ value: room._id, label: room.name })),
      placeholder: "Select a room",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      optionValues: equipmentStatuses,
    },
    { name: "purchaseDate", label: "Purchase Date", type: "date" },
    {
      name: "lastMaintenanceDate",
      label: "Last Maintenance Date",
      type: "date",
    },
    {
      name: "nextMaintenanceDate",
      label: "Next Maintenance Date",
      type: "date",
    },
    {
      name: "manufacturer",
      label: "Manufacturer",
      type: "text",
      placeholder: "Enter manufacturer name",
    },
    {
      name: "model",
      label: "Model",
      type: "text",
      placeholder: "Enter model name",
    },
  ]

  const SortableItem = ({ equipment }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: equipment._id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: `${transition}, opacity 0.2s`,
      padding: "12px",
      borderRadius: "8px",
      backgroundColor: statusColors[equipment.status].backgroundColor,
      boxShadow: isDragging
        ? "0 4px 6px rgba(0,0,0,0.2)"
        : "0 2px 4px rgba(0,0,0,0.1)",
      opacity: isDragging ? 0.8 : 1,
      position: "relative",
      userSelect: "none",
    }

    const dragHandleStyle = {
      cursor: "move",
      padding: "4px",
      marginRight: "8px",
      display: "inline-block",
    }

    const today = new Date()
    const nextMaintenance = equipment.nextMaintenanceDate
      ? new Date(equipment.nextMaintenanceDate)
      : null
    const lastMaintenance = equipment.lastMaintenanceDate
      ? new Date(equipment.lastMaintenanceDate)
      : equipment.purchaseDate
      ? new Date(equipment.purchaseDate)
      : null

    let progress = 0
    let barColor = "#3b82f6"
    let maintenanceStatus = ""
    let showReminder = false
    let barLabel = "Next Maintenance"
    let barColorOverride = null

    if (
      nextMaintenance &&
      lastMaintenance &&
      equipment.status !== "MAINTENANCE"
    ) {
      const totalDuration = nextMaintenance - lastMaintenance
      const timePassed = today - lastMaintenance

      if (totalDuration > 0) {
        progress = (timePassed / totalDuration) * 100
        if (progress < 0) progress = 0
        if (progress > 100) progress = 100

        if (progress < 50) {
          barColor = "#22c55e"
        } else if (progress < 100) {
          barColor = "#f59e0b"
          if (progress >= 80) {
            maintenanceStatus = "Due Soon"
          }
        } else {
          barColor = "#dc2626"
          maintenanceStatus = "Overdue"
        }
      }
    } else if (nextMaintenance && equipment.status !== "MAINTENANCE") {
      if (today > nextMaintenance) {
        progress = 100
        barColor = "#dc2626"
        maintenanceStatus = "Overdue"
      } else {
        progress = 0
        barColor = "#3b82f6"
        const daysUntilMaintenance = Math.ceil(
          (nextMaintenance - today) / (1000 * 60 * 60 * 24)
        )
        if (daysUntilMaintenance <= 7) {
          maintenanceStatus = "Due Soon"
          barColor = "#f59e0b"
        }
      }
    }

    if (equipment.status === "MAINTENANCE") {
      barLabel = "Scheduled Next Maintenance"
      barColorOverride = maintenanceStatus === "Overdue" ? "#dc2626" : "#6b7280"
    } else if (equipment.status === "OUT_OF_ORDER") {
      barLabel = "Next Maintenance (Pending Repair)"
      barColorOverride = "#6b7280"
    }

    if (maintenanceStatus && equipment.status !== "MAINTENANCE") {
      if (equipment.status === "OUT_OF_ORDER") {
        showReminder = false
      } else {
        showReminder = true
      }
    }

    const handleSendReminder = async () => {
      setSendingReminder((prev) => ({ ...prev, [equipment._id]: true }))
      try {
        const message = `Manual reminder: ${equipment.name} (Serial: ${equipment.serialNumber}) is due for maintenance soon!`
        const response = await axios.post(
          `http://localhost:3000/equipments/${equipment._id}/notify`,
          { type: "maintenance", message }
        )
        toast.success(response.data.message || "Reminder sent successfully!")
      } catch (err) {
        toast.error(
          `Failed to send reminder: ${err.response?.data?.error || err.message}`
        )
      } finally {
        setSendingReminder((prev) => ({ ...prev, [equipment._id]: false }))
      }
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={(e) => {
          if (!isDragging) handleOpenModal(equipment)
          e.stopPropagation()
        }}
      >
        <div style={dragHandleStyle} {...attributes} {...listeners}>
          ⋮⋮
        </div>
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
        >
          <span
            style={{
              marginRight: "8px",
              color: statusColors[equipment.status].color,
            }}
          >
            {statusIcons[equipment.status]}
          </span>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: statusColors[equipment.status].color,
            }}
          >
            {equipment.name}
          </div>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: statusColors[equipment.status].color,
          }}
        >
          Serial: {equipment.serialNumber}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: statusColors[equipment.status].color,
          }}
        >
          Room: {equipment.room?.name || "N/A"}
        </div>
        {nextMaintenance && equipment.status !== "MAINTENANCE" && (
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                fontSize: "10px",
                color: statusColors[equipment.status].color,
              }}
            >
              {barLabel}
            </div>
            <div
              style={{
                height: "4px",
                backgroundColor: barColorOverride || barColor,
                borderRadius: "2px",
                width: `${progress}%`,
              }}
            />
            <div
              style={{
                fontSize: "10px",
                color: statusColors[equipment.status].color,
              }}
            >
              {nextMaintenance.toLocaleDateString()}
            </div>
          </div>
        )}
        {showReminder && equipment.status !== "MAINTENANCE" && (
          <div
            style={{
              color: maintenanceStatus === "Overdue" ? "#dc2626" : "#f59e0b",
              fontSize: "12px",
              marginTop: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <AlertCircle size={14} style={{ marginRight: "4px" }} />
            Maintenance {maintenanceStatus}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            display: "flex",
            gap: "8px",
          }}
        >
          {showReminder && equipment.status !== "MAINTENANCE" && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSendReminder()
              }}
              style={{
                background: "none",
                border: "none",
                cursor: sendingReminder[equipment._id]
                  ? "not-allowed"
                  : "pointer",
                opacity: sendingReminder[equipment._id] ? 0.5 : 1,
              }}
              title='Send maintenance reminder'
              disabled={sendingReminder[equipment._id]}
            >
              <AlertCircle
                size={16}
                color={maintenanceStatus === "Overdue" ? "#dc2626" : "#f59e0b"}
              />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log("Edit icon clicked for:", equipment.name)
              handleOpenModal(equipment)
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            title='Edit equipment'
          >
            <Pencil size={16} color='#3b82f6' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log("Delete icon clicked for:", equipment.name)
              handleDelete(equipment._id)
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            title='Delete equipment'
          >
            <Trash2 size={16} color='#ef4444' />
          </button>
        </div>
      </div>
    )
  }

  SortableItem.propTypes = {
    equipment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      serialNumber: PropTypes.string.isRequired,
      room: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
      status: PropTypes.oneOf([
        "AVAILABLE",
        "IN_USE",
        "MAINTENANCE",
        "OUT_OF_ORDER",
      ]).isRequired,
      purchaseDate: PropTypes.string,
      lastMaintenanceDate: PropTypes.string,
      nextMaintenanceDate: PropTypes.string,
      manufacturer: PropTypes.string,
      model: PropTypes.string,
    }).isRequired,
  }

  const DroppableColumn = ({ status }) => {
    const { setNodeRef, isOver } = useDroppable({ id: status })

    const style = {
      flex: "1 1 0",
      width: "250px",
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "16px",
      border: `2px dashed ${isOver ? "#3b82f6" : statusColors[status].color}`,
      minHeight: "200px",
      transition: "border-color 0.2s ease",
      boxSizing: "border-box",
    }

    const statusEquipments = filteredEquipments.filter(
      (eq) => eq.status === status
    )

    return (
      <div ref={setNodeRef} style={style}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: statusColors[status].color,
            marginBottom: "12px",
          }}
        >
          {status} ({statusEquipments.length})
        </h3>
        <SortableContext
          items={statusEquipments.map((eq) => eq._id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {statusEquipments.map((equipment) => (
              <SortableItem key={equipment._id} equipment={equipment} />
            ))}
          </div>
        </SortableContext>
      </div>
    )
  }

  DroppableColumn.propTypes = {
    status: PropTypes.oneOf([
      "AVAILABLE",
      "IN_USE",
      "MAINTENANCE",
      "OUT_OF_ORDER",
    ]).isRequired,
  }

  const activeEquipment = equipments.find((eq) => eq._id === activeId)
  const overlayStyle = activeEquipment
    ? {
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: statusColors[activeEquipment.status].backgroundColor,
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        opacity: "0.9",
        zIndex: 1000,
      }
    : {}

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
            backgroundColor: "#ff3b3f",
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

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {equipmentStatuses.map((status) => (
            <DroppableColumn key={status} status={status} />
          ))}
        </div>
        <DragOverlay>
          {activeEquipment && (
            <div style={overlayStyle}>{activeEquipment.name}</div>
          )}
        </DragOverlay>
      </DndContext>

      <Tooltip id='equipment-tooltip' place='top' effect='solid' />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentEquipment ? "Edit Equipment" : "Add Equipment"}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        errors={errors}
        fields={equipmentFields}
      />
    </div>
  )
}

export default Equipment
