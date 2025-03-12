import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditMedicalTreatment = () => {
  const { id } = useParams(); // ID du traitement
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPatient = location.state?.patient || null; // Access selectedPatient
  const patientId = selectedPatient?._id || null; // Extract patientId

  const predefinedCategories = ['TRAUMA', 'SURGICAL', 'PSYCHIATRIC', 'RESPIRATORY', 'CARDIAC'];

  const [treatment, setTreatment] = useState({
    category: '',
    customCategory: '',
    status: false,
    details: '',
    startDate: '',
    endDate: '',
    treatedBy: '',
    patient: patientId, // Set patient ID from selectedPatient
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    const fetchTreatment = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/treatments/${id}`);
        console.log("Données récupérées:", response.data);

        const data = response.data;
        setTreatment({
          category: predefinedCategories.includes(data.category) ? data.category : '',
          customCategory: predefinedCategories.includes(data.category) ? '' : data.category,
          status: data.status,
          details: data.details,
          startDate: data.startDate ? new Date(data.startDate).toISOString().substr(0, 10) : '',
          endDate: data.endDate ? new Date(data.endDate).toISOString().substr(0, 10) : '',
          treatedBy: data.treatedBy,
          patient: data.patient,
        });

        if (!predefinedCategories.includes(data.category)) {
          setUseCustomCategory(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du traitement:', error);
        toast.error('Erreur de chargement des données.');
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3000/employee/employees/doctor');
        const formattedDoctors = response.data.map((doctor) => ({
          value: doctor._id,
          label: `${doctor.name} (${doctor.specialization})`,
        }));
        setDoctors(formattedDoctors);
      } catch (error) {
        console.error('Erreur lors de la récupération des médecins:', error);
        toast.error('Erreur de chargement des médecins.');
      } finally {
        setLoading(false);
      }
    };

    fetchTreatment();
    fetchDoctors();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTreatment((prevTreatment) => ({
      ...prevTreatment,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value === 'CUSTOM') {
      setUseCustomCategory(true);
      setTreatment((prev) => ({ ...prev, category: '', customCategory: '' }));
    } else {
      setUseCustomCategory(false);
      setTreatment((prev) => ({ ...prev, category: value, customCategory: '' }));
    }
  };

  const handleDoctorSelect = (selectedOption) => {
    setTreatment((prevTreatment) => ({
      ...prevTreatment,
      treatedBy: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    let categoryToSend = useCustomCategory ? treatment.customCategory.trim().toUpperCase() : treatment.category;

    const treatmentData = {
      category: categoryToSend,
      status: treatment.status,
      details: treatment.details,
      startDate: new Date(treatment.startDate),
      endDate: treatment.endDate ? new Date(treatment.endDate) : null,
      treatedBy: treatment.treatedBy,
      patient: treatment.patient,
    };

    try {
      await axios.put(`http://localhost:3000/api/treatments/${id}`, treatmentData);
      toast.success('Traitement mis à jour avec succès!');

      // Navigate to the patient's treatment list using patientId
      if (patientId) {
        navigate(`/medical-treatments/patient/show/${patientId}`, {
          state: { patient: selectedPatient }, // Pass selectedPatient if needed
        });
      } else {
        console.error('Patient ID is missing');
        toast.error('Erreur: ID du patient manquant.');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du traitement:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
        toast.error(`Erreur: ${error.response.data.message || 'Données invalides'}`);
      } else {
        toast.error('Erreur réseau. Veuillez réessayer.');
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (!treatment.category && !useCustomCategory) {
      toast.error("Veuillez sélectionner une catégorie.");
      isValid = false;
    }
    if (useCustomCategory && (!treatment.customCategory.trim() || treatment.customCategory.length < 3)) {
      toast.error("La catégorie personnalisée doit contenir au moins 3 caractères.");
      isValid = false;
    }
    if (!treatment.details.trim() || treatment.details.length < 10) {
      toast.error("Les détails doivent contenir au moins 10 caractères.");
      isValid = false;
    }
    if (!treatment.startDate) {
      toast.error("Veuillez sélectionner une date de début.");
      isValid = false;
    }
    if (treatment.endDate) {
      const startDate = new Date(treatment.startDate);
      const endDate = new Date(treatment.endDate);
      if (endDate < startDate) {
        toast.error("La date de fin ne peut pas être antérieure à la date de début.");
        isValid = false;
      }
    }
    if (!treatment.treatedBy) {
      toast.error("Veuillez sélectionner un médecin.");
      isValid = false;
    }
    return isValid;
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="text-center mb-4 card p-3">Modifier le traitement</h1>
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
        {/* Catégorie */}
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Catégorie</label>
          <select
            className="form-select"
            id="category"
            name="category"
            value={treatment.category}
            onChange={handleCategoryChange}
            required={!useCustomCategory}
            disabled={useCustomCategory}
          >
            <option value="">Sélectionnez une catégorie</option>
            {predefinedCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="CUSTOM">Autre...</option>
          </select>
        </div>

        {/* Champ pour la nouvelle catégorie */}
        {useCustomCategory && (
          <div className="mb-3">
            <label htmlFor="customCategory" className="form-label">Nouvelle Catégorie</label>
            <input
              type="text"
              className="form-control"
              id="customCategory"
              name="customCategory"
              value={treatment.customCategory}
              onChange={handleChange}
              required
            />
          </div>
        )}

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
          <label htmlFor="status" className="form-check-label">Traitement actif</label>
        </div>

        {/* Détails */}
        <div className="mb-3">
          <label htmlFor="details" className="form-label">Détails du Traitement</label>
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
          <label htmlFor="startDate" className="form-label">Date de début</label>
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
          <label htmlFor="endDate" className="form-label">Date de fin (optionnelle)</label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            name="endDate"
            value={treatment.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Médecin traitant */}
        <div className="mb-3">
          <label className="form-label">Médecin traitant</label>
          <Select
            options={doctors}
            isLoading={loading}
            onChange={handleDoctorSelect}
            placeholder="Sélectionner un médecin..."
            isSearchable
            required
            value={doctors.find((d) => d.value === treatment.treatedBy)}
          />
        </div>

        {/* Bouton de soumission */}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">Mettre à jour</button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicalTreatment;