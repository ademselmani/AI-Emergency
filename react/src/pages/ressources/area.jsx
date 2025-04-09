/** @format */

import React, { useState, useEffect } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import Modal from "../../components/ressourcesComponent/modal"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Area = () => {
  const [areas, setAreas] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentArea, setCurrentArea] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  // Fetch areas from the backend
  useEffect(() => {
    fetchAreas()
  }, [])

  const fetchAreas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/areas")
      setAreas(Array.isArray(response.data) ? response.data : [])
      setLoading(false)
    } catch (err) {
      setError(`Failed to fetch areas: ${err.message}`)
      setLoading(false)
    }
  }

  // Open modal for adding or editing an area
  const handleOpenModal = (area) => {
    if (area) {
      setCurrentArea(area)
      setFormData({
        name: area.name || "",
        description: area.description || "",
      })
    } else {
      setCurrentArea(null)
      setFormData({
        name: "",
        description: "",
      })
    }
    setIsModalOpen(true)
    setErrors({})
  }

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentArea(null)
    setFormData({
      name: "",
      description: "",
    })
    setErrors({})
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const requiredFields = ["name"]
    const missingFields = requiredFields.filter(
      (field) =>
        !formData[field] ||
        (typeof formData[field] === "string" && formData[field].trim() === "")
    )
    if (missingFields.length > 0) {
      setErrors({
        general: `Missing required fields: ${missingFields.join(", ")}`,
      })
      toast.error(`Missing required fields: ${missingFields.join(", ")}`)
      return
    }

    try {
      if (currentArea) {
        // Update existing area
        const response = await axios.put(
          `http://localhost:3000/areas/${currentArea._id}`,
          formData
        )
        setAreas(
          areas.map((area) =>
            area._id === currentArea._id ? response.data : area
          )
        )
        toast.success("Area updated successfully!")
      } else {
        // Create new area
        const response = await axios.post(
          "http://localhost:3000/areas",
          formData
        )
        setAreas([...areas, response.data])
        toast.success("Area created successfully!")
      }
      handleCloseModal()
    } catch (err) {
      console.error("Submit Error:", err)
      if (err.response && err.response.data.errors) {
        setErrors(err.response.data.errors)
        toast.error("Validation failed. Check the form for errors.")
      } else {
        setErrors({
          general: `Failed to ${currentArea ? "update" : "create"} area: ${
            err.message
          }`,
        })
        toast.error(
          `Failed to ${currentArea ? "update" : "create"} area: ${err.message}`
        )
      }
    }
  }

  // Handle area deletion
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/areas/${id}`)
      setAreas(areas.filter((area) => area._id !== id))
      toast.success("Area deleted successfully!")
    } catch (err) {
      setError(`Failed to delete area: ${err.message}`)
      toast.error(`Failed to delete area: ${err.message}`)
    }
  }

  // Loading and error states
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

  // Predefined area names from the schema
  const areaNames = [
    "TRIAGE",
    "RESUSCITATION_AREA",
    "MAJOR_TRAUMA",
    "CONSULTATION",
    "OBSERVATION_UNIT",
  ]

  // Define form fields for the Modal
  const areaFields = [
    {
      name: "name",
      label: "Area Name",
      type: "select",
      options: areaNames.map((name) => ({ value: name, label: name })),
      placeholder: "Select an area",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter description",
      rows: 3,
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
          Area Management
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
          <Plus size={18} style={{ marginRight: "8px" }} /> Add Area
        </button>
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
                Description
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
            {areas.map((area) => (
              <tr key={area._id} style={{ backgroundColor: "#fff" }}>
                <td
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    color: "#1f2937",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {area.name}
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
                  {area.description || "No description"}
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
                    onClick={() => handleOpenModal(area)}
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
                    onClick={() => handleDelete(area._id)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for adding/editing areas */}
      <Modal
        key={currentArea?._id || "new-area"}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentArea ? "Edit Area" : "Add New Area"}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        errors={errors}
        fields={areaFields}
      />
    </div>
  )
}

export default Area
