/** @format */

import React from "react"
import PropTypes from "prop-types"
import "./ProfileCard.css"
import { Link } from "react-router-dom"

// Objet de couleurs pour les rôles
const roleColors = {
  doctor: "#FEBB0B", // Jaune
  nurse: "#2196F3", // Bleu
  triage_nurse: "#E91E63", // Rose
  receptionnist: "#9C27B0", // Violet
  ambulance_driver: "#00BCD4", // Cyan
}

// Objet de couleurs pour les statuts
const statusColors = {
  active: "#4CAF50", // Vert
  on_leave: "#FF9800", // Orange
  retired: "#F44336", // Rouge
}

const ProfileCard = ({ employee = {}, onDelete }) => {
  // Déstructuration avec valeurs par défaut
  const {
    id, // ID de l'employé ajouté ici
    role = "N/A",
    name = "N/A",
    image = "N/A",
    familyName = "N/A",
    adresse = "N/A",
    status = "N/A",
    qualifications = {},
  } = employee

  const {
    degree = "N/A",
    institution = "N/A",
    year = "N/A",
    certifications = {},
  } = qualifications

  const { certification = "N/A" } = certifications

  // Couleur du rôle (par défaut gris si le rôle n'est pas trouvé)
  const roleColor = roleColors[role] || "#CCCCCC"

  // Couleur du statut (par défaut gris si le statut n'est pas trouvé)
  const statusColor = statusColors[status] || "#CCCCCC"

  // Fonction de suppression
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        // Appeler la fonction de suppression passée via les props (onDelete)
        await onDelete(id)
        alert("Employee deleted successfully")
      } catch (error) {
        console.error("Error deleting employee:", error)
        alert("There was an error deleting the employee.")
      }
    }
  }

  return (
    <div className='card-container'>
      {/* Badge de rôle avec couleur dynamique */}
      <span className='pro' style={{ backgroundColor: roleColor }}>
        {role}
      </span>
      <img
        className='round'
        src={
          image || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
        }
        alt='user'
      />
      <h3>
        {name} {familyName}
      </h3>
      <h6>{adresse}</h6>
      {/* Statut avec couleur dynamique */}
      <p>
        {" "}
        <span style={{ color: statusColor, fontWeight: "bold" }}>{status}</span>
      </p>
      <div className='buttons'>
        <button className='primary delete' onClick={handleDelete}>
          Delete
        </button>
        <Link to={`/user/profile/${id}`}>
          <button className='primary ghost'>View Profile</button>
        </Link>
      </div>
      <div className='skills'>
        <h6>Qualifications</h6>
        <ul>
          <li>Degree: {degree}</li>
          <li>Institution: {institution}</li>
          <li>Year: {year}</li>
          {certification !== "N/A" && <li>Certifications: {certification}</li>}
        </ul>
      </div>
    </div>
  )
}

// Validation des props
ProfileCard.propTypes = {
  employee: PropTypes.shape({
    id: PropTypes.string.isRequired, // Assurez-vous que l'ID est passé en prop
    role: PropTypes.string,
    name: PropTypes.string,
    familyName: PropTypes.string,
    adresse: PropTypes.string,
    status: PropTypes.string,
    qualifications: PropTypes.shape({
      degree: PropTypes.string,
      institution: PropTypes.string,
      year: PropTypes.number,
      certifications: PropTypes.shape({
        certification: PropTypes.string,
      }),
    }),
  }),
  // Fonction de suppression passée en prop
  onDelete: PropTypes.func.isRequired,
}

export default ProfileCard
