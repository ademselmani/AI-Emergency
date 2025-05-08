/** @format */

import React, { useEffect, useState } from "react"
import ProfileCard from "./ProfileCard"
import "./ListeEmployees.css"

const ListeEmployees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Chargement des employés depuis l'API
  useEffect(() => {
    fetch("http://localhost:3000/user/employees")
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((employee) => ({
          ...employee,
          id: employee._id, // Transforme _id en id
        }))
        setEmployees(formattedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des employés", error)
        setError("Erreur lors de la récupération des employés")
        setLoading(false)
      })
  }, [])

  // Fonction pour supprimer un employé
  const deleteEmployee = async (id) => {
    try {
      // Appel de l'API pour supprimer l'employé
      await fetch(`http://localhost:3000/user/employees/${id}`, {
        method: "DELETE",
      })

      // Mise à jour de l'état pour enlever l'employé de la liste
      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee.id !== id)
      )
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé", error)
      alert("Erreur lors de la suppression de l'employé")
    }
  }

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return <div>Chargement en cours...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  // Affichage principal
  return (
    <div className='liste-employees'>
      <h1>Liste des Employés</h1>
      <div className='card-list'>
        {employees.map((employee) => (
          <ProfileCard
            key={employee.id}
            employee={employee}
            onDelete={deleteEmployee} 
          />
        ))}
      </div>
    </div>
  )
}

export default ListeEmployees
