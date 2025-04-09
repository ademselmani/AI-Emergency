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
  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const renderField = (field) => {
    const {
      name,
      label,
      type,
      placeholder,
      required,
      options,
      optionValues,
      rows,
    } = field
    const error = errors[name] || errors.general

    switch (type) {
      case "text":
      case "number":
        return (
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor={name}
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={formData[name] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              required={required}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {error && (
              <p
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {error}
              </p>
            )}
          </div>
        )

      case "select":
        return (
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor={name}
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              {label}
            </label>
            <select
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              required={required}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              <option value='' disabled>
                {placeholder || "Select an option"}
              </option>
              {(options || optionValues || []).map((option) => (
                <option
                  key={option.value || option}
                  value={option.value || option}
                >
                  {option.label || option}
                </option>
              ))}
            </select>
            {error && (
              <p
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {error}
              </p>
            )}
          </div>
        )

      case "textarea": // Add support for textarea
        return (
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor={name}
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "4px",
              }}
            >
              {label}
            </label>
            <textarea
              id={name}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              placeholder={placeholder}
              rows={rows || 3}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {error && (
              <p
                style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}
              >
                {error}
              </p>
            )}
          </div>
        )

      default:
        return (
          <p style={{ color: "#dc2626" }}>
            Unsupported field type: {type} for {name}
          </p>
        )
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "24px",
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90%",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#6b7280",
            }}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name}>{renderField(field)}</div>
          ))}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
          >
            <button
              type='button'
              onClick={onClose}
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
  formData: PropTypes.object,
  setFormData: PropTypes.func,
  handleSubmit: PropTypes.func.isRequired,
  errors: PropTypes.object,
  fields: PropTypes.array.isRequired,
}

export default Modal
