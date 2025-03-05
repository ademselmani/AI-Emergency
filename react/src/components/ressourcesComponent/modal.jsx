/** @format */

import React from "react"
import { X } from "lucide-react"

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  // Modal backdrop style
  const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  // Modal content style
  const contentStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    padding: "20px",
    maxWidth: "600px",
    width: "90%",
    position: "relative",
  }

  // Header style
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: "10px",
  }

  // Title style
  const titleStyle = {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a202c",
    margin: 0,
  }

  // Close button style
  const closeButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#718096",
    padding: "5px",
    transition: "color 0.2s",
  }

  // Hover effect for close button
  const closeButtonHoverStyle = {
    color: "#4a5568",
  }

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div
        style={contentStyle}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <div style={headerStyle}>
          <h3 style={titleStyle}>{title}</h3>
          <button
            type='button'
            style={closeButtonStyle}
            onClick={onClose}
            onMouseOver={(e) =>
              (e.target.style.color = closeButtonHoverStyle.color)
            }
            onMouseOut={(e) => (e.target.style.color = closeButtonStyle.color)}
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
