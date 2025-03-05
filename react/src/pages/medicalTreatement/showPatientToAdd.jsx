import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select'; // Import react-select

const ShowPatientToAdd = () => {
  const { patientId } = useParams();  // Retrieve patientId from the URL
  const location = useLocation();  // Access the state passed via NavLink
  const navigate = useNavigate();

  // If state is passed through NavLink, we can also access selectedPatient here
  const selectedPatient = location.state ? location.state.patient : null;
  useEffect(() => {
     console.log('Selected Patient from state:', selectedPatient._id );
  }, [patientId, selectedPatient]);

   // State for treatment form
  const [treatment, setTreatment] = useState({
    category: '',
    status: false,
    details: '',
    startDate: '',
    endDate: '',
    treatedBy: '', // Will store the selected doctor's ID
    patient: selectedPatient._id , // Set the patient ID from selectedPatient
  });

  // State for doctors list
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for doctors fetch

  // Fetch doctors from the API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3000/employee/employees/doctor');
        const formattedDoctors = response.data.map((doctor) => ({
          value: doctor._id, // Use the doctor's ID as the value
          label: `${doctor.name} (${doctor.specialization})`, // Display name and specialization
        }));
        setDoctors(formattedDoctors);
      } catch (error) {
        console.error('Erreur lors de la récupération des médecins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

   const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTreatment((prevTreatment) => ({
      ...prevTreatment, 
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

   const handleDoctorSelect = (selectedOption) => {
    setTreatment((prevTreatment) => ({
      ...prevTreatment,
      treatedBy: selectedOption ? selectedOption.value : '', // Store the selected doctor's ID
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
 
  
     const treatmentWithPatient = { ...treatment, patient: selectedPatient._id };
  
    try {
      // Send the treatment data to the backend with the correct patientId in the request body
      await axios.post(`http://localhost:3000/api/treatments/${treatment.patient}`, treatment);
  
      navigate(`/medical-treatments/patient/show/${treatment.patient}`, {
        state: { patient: selectedPatient }
      });

    } catch (error) {
      console.error('Erreur lors de l\'ajout du traitement:', error);
  
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Erreur: ${error.response.data.message || 'Données invalides'}`);
      }
    }
  };
  
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Ajouter un Traitement Médical</h1>
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm">
        {/* Catégorie */}
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Catégorie
          </label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={treatment.category}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            <option value="TRAUMA">Trauma</option>
            <option value="SURGICAL">Chirurgical</option>
            <option value="PSYCHIATRIC">Psychiatrique</option>
            <option value="RESPIRATORY">Respiratoire</option>
            <option value="CARDIAC">Cardiaque</option>
          </select>
        </div>

        {/* Statut */}
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="status"
            name="status"
            checked={treatment.status}
            onChange={handleChange}
          />
          <label htmlFor="status" className="form-check-label">
            Traitement actif
          </label>
        </div>

        {/* Détails */}
        <div className="mb-3">
          <label htmlFor="details" className="form-label">
            Détails du Traitement
          </label>
          <textarea
            className="form-control"
            id="details"
            name="details"
            rows="3"
            value={treatment.details}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date de début */}
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">
            Date de début
          </label>
          <input
            type="date"
            className="form-control"
            id="startDate"
            name="startDate"
            value={treatment.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Date de fin */}
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">
            Date de fin (optionnelle)
          </label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            name="endDate"
            value={treatment.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Traité par (Searchable Dropdown) */}
        <div className="mb-3">
          <label htmlFor="treatedBy" className="form-label">
            Traité par
          </label>
          <Select
            id="treatedBy"
            name="treatedBy"
            options={doctors}
            isLoading={loading} // Show loading indicator while fetching doctors
            onChange={handleDoctorSelect} // Handle doctor selection
            placeholder="Rechercher un médecin..."
            isSearchable // Enable search functionality
            required
          />
        </div>

        {/* Bouton de soumission */}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Ajouter le Traitement
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShowPatientToAdd;
