/** @format */

import React, { useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import "./ProfileCard.css"

// Role and status color definitions
const roleColors = {
  doctor: "#2A6EBB",
  nurse: "#1A8E5F",
  triage_nurse: "#D81B60",
  receptionnist: "#6A1B9A",
  ambulance_driver: "#0288D1",
}

const statusColors = {
  active: "#2ECC71",
  on_leave: "#F39C12",
  retired: "#E74C3C",
}

const ProfileCard = ({ employee = {}, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const {
    id,
    role = "N/A",
    name = "N/A",
    image,
    familyName = "N/A",
    adresse = "N/A",
    gender = "N/A",
    status = "N/A",
    qualifications = {},
  } = employee

  const { degree = "N/A" } = qualifications

  const roleColor = roleColors[role.toLowerCase()] || "#90A4AE"
  const statusColor = statusColors[status.toLowerCase()] || "#90A4AE"

  const handleDeleteClick = () => {
    setDeleteError(null)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(id)
      setShowDeleteModal(false)
      toast.success(
        <div>
          <h6>Profile Deleted Successfully</h6>
          <p>
            {name} {familyName}'s profile has been removed from the system.
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: `delete-success-${id}`,
        }
      )
    } catch (error) {
      console.error("Error deleting employee:", error)
      setDeleteError("Failed to delete employee. Please try again.")
      toast.error(
        <div>
          <h6>Deletion Failed</h6>
          <p>
            Could not delete {name} {familyName}'s profile. Please try again.
          </p>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          toastId: `delete-error-${id}`,
        }
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteError(null)
  }

  return (
    <>
      <div className='profile-card'>
        <div className='card-header'>
          <span className='role-badge' style={{ backgroundColor: roleColor }}>
            {role.toUpperCase()}
          </span>
        </div>
        <div className='card-content'>
          <div className='avatar-container'>
            <img
              className='photo'
              src={
                image ||
                "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
              }
              alt={`${name} ${familyName}`}
            />
            <span
              className='status-indicator'
              style={{ backgroundColor: statusColor }}
            />
          </div>
          <h3 className='employee-name'>
            {name} {familyName}
          </h3>
          <p className='employee-address'>Address: {adresse}</p>
          <p>Gender: {gender}</p>
          <div className='status-container'>
            <span className='status-label'>Status: </span>
            <span className='status-value' style={{ color: statusColor }}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className='card-footer'>
          <button
            className='btn btn-outline-danger'
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                ></span>
                Deleting...
              </>
            ) : (
              "Delete Profile"
            )}
          </button>
          <Link to={`/user/profile/${id}`}>
            <button className='btn btn-primary ms-2'>View Profile</button>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {name} {familyName}'s profile?
              This action cannot be undone.
            </p>
            {deleteError && (
              <div className='alert alert-danger'>{deleteError}</div>
            )}
            <div className='modal-actions'>
              <button
                className='btn btn-outline-secondary'
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className='btn btn-danger ms-2'
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-2'
                      role='status'
                      aria-hidden='true'
                    ></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Permanently"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

ProfileCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.string.isRequired,
    role: PropTypes.string,
    name: PropTypes.string,
    familyName: PropTypes.string,
    image: PropTypes.string,
    adresse: PropTypes.string,
    gender: PropTypes.string,
    status: PropTypes.string,
    qualifications: PropTypes.shape({
      degree: PropTypes.string,
    }),
  }),
  onDelete: PropTypes.func.isRequired,
}

export default ProfileCard
