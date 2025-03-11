/** @format */

import React from "react"
import PropTypes from "prop-types"

const Modal = ({
  isOpen,
  onClose,
  title,
  formData,
  setFormData,
  handleSubmit,
  errors,
  fields,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`handleInputChange: Setting ${name} to ${value}`) // Debug log
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  if (!isOpen) return null

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "16px",
    boxSizing: "border-box",
    height: "auto",
    display: "block",
    outline: "1px solid transparent", // Temporary for debugging
  }

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    padding: "30px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    width: "600px",
    maxWidth: "90%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
  }

  const errorStyle = {
    color: "#dc2626",
    fontSize: "14px",
    marginTop: "-8px",
    marginBottom: "8px",
  }

  const labelStyle = {
    fontWeight: "500",
    marginBottom: "6px",
    display: "block",
    fontSize: "16px",
  }

  const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  }

  console.log(
    "Rendering Modal with fields:",
    fields.map((f) => ({ name: f.name, type: f.type }))
  )
  console.log("Rendering Modal with formData:", formData)

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div style={formStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ✕
          </button>
        </div>
        {errors.general && <div style={errorStyle}>{errors.general}</div>}
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} style={{ minHeight: "70px" }}>
              <label style={labelStyle}>{field.label}</label>
              {field.type === "text" ||
              field.type === "number" ||
              field.type === "date" ? (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  style={inputStyle}
                  required={field.required || false}
                  data-field-name={field.name} // For DOM inspection
                />
              ) : field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required={field.required || false}
                >
                  <option value='' disabled>
                    {field.placeholder || "Select an option"}
                  </option>
                  {field.options
                    ? field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    : field.optionValues?.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                </select>
              ) : (
                <div style={{ color: "red" }}>
                  Unsupported field type: {field.type} for {field.name}
                </div>
              )}
              {errors[field.name] && (
                <div style={errorStyle}>{errors[field.name]}</div>
              )}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "25px",
            }}
          >
            <button
              type='button'
              onClick={onClose}
              style={{
                ...buttonStyle,
                backgroundColor: "#e5e7eb",
              }}
            >
              Cancel
            </button>
            <button
              type='submit'
              style={{
                ...buttonStyle,
                backgroundColor: "#3b82f6",
                color: "#fff",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["text", "number", "date", "select"]),
      placeholder: PropTypes.string,
      required: PropTypes.bool,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          label: PropTypes.string,
        })
      ),
      optionValues: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
}

export default Modal
