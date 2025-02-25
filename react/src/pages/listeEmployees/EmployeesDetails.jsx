/** @format */

import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "./EmployeesDetails.css"

const EmployeesDetails = () => {
  const { id } = useParams()
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    image: "",
    address: "",
    education: "",
    role: "", // Ajout du champ role
    phone: "",
    email: "",
  })

  // Liste des rôles disponibles
  const roles = [
    "admin",
    "doctor",
    "nurse",
    "triage_nurse",
    "receptionnist",
    "ambulance_driver",
  ]

  // Charger les données de l'employé
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/user/employees/${id}`
        )
        const data = await response.json()
        setProfileData({
          firstName: data.name || "",
          lastName: data.familyName || "",
          image: data.image || "",
          address: data.adresse || "",
          education: data.qualifications?.degree || "",
          role: data.role || "", 
          phone: data.phone || "",
          email: data.email || "",
        })
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
      }
    }

    fetchEmployeeData()
  }, [id])

  // Gérer le changement des champs du formulaire
  const handleInputChange = (e) => {
    const { id, value } = e.target
    setProfileData({ ...profileData, [id]: value })
  }

  // Gérer l'upload de l'image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const formData = new FormData()
      formData.append("image", file)

      try {
        const response = await fetch("http://localhost:3001/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload de l'image")
        }

        const data = await response.json()
        setProfileData({ ...profileData, image: data.imageUrl })
        alert("Image uploadée avec succès!")
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error)
        alert("Erreur lors de l'upload de l'image.")
      }
    }
  }

  // Gérer la suppression de l'image
  const handleRemoveImage = () => {
    setProfileData({ ...profileData, image: "" })
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSubmit = {
        ...profileData,
        name: profileData.firstName,
        familyName: profileData.lastName,
        adresse: profileData.address,
        role: profileData.role, // Inclure le rôle
        qualifications: {
          degree: profileData.education,
        },
        image: profileData.image,
      }

      const response = await fetch(
        `http://localhost:3001/user/employees/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSubmit),
        }
      )

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du profil")
      }

      console.log("Formulaire soumis avec les données:", dataToSubmit)
      alert("Profil mis à jour avec succès!")
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      alert("Erreur lors de la mise à jour du profil.")
    }
  }

  return (
    <section className='bg-light py-3 py-md-5 py-xl-8'>
      <div className='container'>
        <div className='row justify-content-md-center'>
          <div className='col-12 col-md-10 col-lg-8 col-xl-7 col-xxl-6'>
            <h2 className='mb-4 display-5 text-center'>Détails de l'employé</h2>
            <p className='text-secondary text-center lead fs-4 mb-5'>
              Ici, vous pouvez voir et gérer les détails de l'employé.
            </p>
            <hr className='w-50 mx-auto mb-5 mb-xl-9 border-dark-subtle' />
          </div>
        </div>
      </div>

      <div className='container'>
        <div className='row gy-4 gy-lg-0'>
          {/* Colonne de gauche */}
          <div className='col-12 col-lg-4 col-xl-3'>
            <div className='row gy-4'>
              {/* Carte de profil */}
              <div className='col-12'>
                <div className='card widget-card border-light shadow-sm'>
                  <div className='card-header text-bg-primary'>Profil</div>
                  <div className='card-body'>
                    <div className='text-center mb-3'>
                      <img
                        src={
                          profileData.image ||
                          "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
                        }
                        className='img-fluid rounded-circle'
                        alt={`${profileData.firstName} ${profileData.lastName}`}
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h5 className='text-center mb-1'>
                      {profileData.firstName} {profileData.lastName}
                    </h5>
                    <p className='text-center text-secondary mb-4'>
                      {profileData.role} {/* Afficher le rôle */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite */}
          <div className='col-12 col-lg-8 col-xl-9'>
            <div className='card widget-card border-light shadow-sm'>
              <div className='card-body p-4'>
                <form onSubmit={handleSubmit} className='row gy-3 gy-xxl-4'>
                  {/* Upload d'image */}
                  <div className='col-12'>
                    <div className='row gy-2'>
                      <label className='col-12 form-label m-0'>
                        Image de profil
                      </label>
                      <div className='col-12'>
                        <img
                          src={
                            profileData.image ||
                            "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"
                          }
                          className='img-fluid'
                          alt={`${profileData.firstName} ${profileData.lastName}`}
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                      <div className='col-12'>
                        <input
                          type='file'
                          id='imageUpload'
                          accept='image/*'
                          style={{ display: "none" }}
                          onChange={handleImageUpload}
                        />
                        <button
                          type='button'
                          className='btn btn-primary me-2'
                          onClick={() =>
                            document.getElementById("imageUpload").click()
                          }
                        >
                          <i className='bi bi-upload me-1'></i> Upload
                        </button>
                        <button
                          type='button'
                          className='btn btn-danger'
                          onClick={handleRemoveImage}
                        >
                          <i className='bi bi-trash me-1'></i> Supprimer
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Champs du formulaire */}
                  <div className='col-12 col-md-6'>
                    <label htmlFor='firstName' className='form-label'>
                      Prénom
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='firstName'
                      value={profileData.firstName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label htmlFor='lastName' className='form-label'>
                      Nom
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='lastName'
                      value={profileData.lastName || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label htmlFor='education' className='form-label'>
                      Éducation
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='education'
                      value={profileData.education || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label htmlFor='role' className='form-label'>
                      Rôle
                    </label>
                    <select
                      className='form-control'
                      id='role'
                      value={profileData.role || ""}
                      onChange={handleInputChange}
                    >
                      <option value=''>Sélectionnez un rôle</option>
                      {roles
                        .filter((role) => role !== "admin")
                        .map((role, index) => (
                          <option key={index} value={role}>
                            {role}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className='col-12 col-md-6'>
                    <label htmlFor='phone' className='form-label'>
                      Téléphone
                    </label>
                    <input
                      type='tel'
                      className='form-control'
                      id='phone'
                      value={profileData.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label htmlFor='email' className='form-label'>
                      Email
                    </label>
                    <input
                      type='email'
                      className='form-control'
                      id='email'
                      value={profileData.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='col-12 col-md-6'>
                    <label htmlFor='address' className='form-label'>
                      Adresse
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      id='address'
                      value={profileData.address || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='col-12'>
                    <button type='submit' className='btn btn-primary'>
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EmployeesDetails
