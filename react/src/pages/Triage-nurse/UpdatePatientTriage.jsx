import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdatePatientTriage.css';

const UpdatePatientTriage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Infos basiques du patient (Nom, Prénom, etc.)
  const [admissionData, setAdmissionData] = useState({
    name: '',
    surname: '',
    age: '',
    gender: '',
    arrivalMode: '',
    isInjured: '',
    mentalState: '',
    hasPain: '',
    painScale: '',
    bodyTemperature: '',
    systolicBP: '',
    diastolicBP: '',
    heartRate: '',
    respirationRate: ''
  });

  // 2. État et zone d’urgence
  const [patient, setPatient] = useState({
    status: 'Triage',
    emergencyArea: ''
  });

  // 3. Gestion d’état du chargement, des messages et des erreurs
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Récupération du patient depuis l’API (si tu veux charger des données existantes)
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3000/api/patients/${id}`)
        .then(response => {
          const data = response.data.data;
          setPatient({
            status: data.status || 'Triage',
            emergencyArea: data.emergencyArea || ''
          });
          setAdmissionData({
            name: data.name || '',
            surname: data.surname || '',
            age: data.age || '',
            gender: data.gender || '',
            arrivalMode: data.arrivalMode || '',
            isInjured: data.isInjured || '',
            mentalState: data.mentalState || '',
            hasPain: data.hasPain || '',
            painScale: data.painScale || '',
            bodyTemperature: data.bodyTemperature || '',
            systolicBP: data.systolicBP || '',
            diastolicBP: data.diastolicBP || '',
            heartRate: data.heartRate || '',
            respirationRate: data.respirationRate || ''
          });
          setLoading(false);
        })
        .catch(error => {
          setMessage(`Error: ${error.response?.data?.error || error.message}`);
          setLoading(false);
        });
    }
  }, [id]);

  // Gère le changement des champs admissionData
  const handleAdmissionChange = (e) => {
    const { name, value } = e.target;
    setAdmissionData(prev => ({ ...prev, [name]: value }));
    // Efface l'erreur associée à ce champ au fur et à mesure de la saisie
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Gère le changement des champs status & emergencyArea
  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validation du formulaire : vérifie que chaque champ est rempli
  const validateForm = () => {
    const newErrors = {};

    // Vérification des champs admissionData
    for (const key in admissionData) {
      if (admissionData[key].toString().trim() === '') {
        newErrors[key] = `Veuillez remplir le champ ${key}.`;
      }
    }
    // Vérification des champs patient
    for (const key in patient) {
      if (patient[key].toString().trim() === '') {
        newErrors[key] = `Veuillez remplir le champ ${key}.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Contrôle de saisie manuel
    if (!validateForm()) {
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/patients/${id}`, {
        ...admissionData,
        status: patient.status,
        emergencyArea: patient.emergencyArea
      });
      setMessage('Patient info successfully updated!');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // Bouton Triage (pour plus tard, si tu veux appeler un modèle IA)
  const handleTriageClick = () => {
    alert("Triage analysis will be available soon!");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <div className="card p-4 shadow">
      <h2 className="text-center mb-4">Update Patient Status & Emergency Area</h2>
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Section 1: Infos de base */}
          <fieldset>
            <legend>Basic Information</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Name *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  name="name"
                  value={admissionData.name}
                  onChange={handleAdmissionChange}
                />
                {errors.name && <small className="text-danger">{errors.name}</small>}
              </div>
              <div className="col-md-6">
                <label>Surname *</label>
                <input
                  type="text"
                  className={`form-control ${errors.surname ? 'error' : ''}`}
                  name="surname"
                  value={admissionData.surname}
                  onChange={handleAdmissionChange}
                />
                {errors.surname && <small className="text-danger">{errors.surname}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Age (Years) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.age ? 'error' : ''}`}
                  name="age"
                  value={admissionData.age}
                  onChange={handleAdmissionChange}
                />
                {errors.age && <small className="text-danger">{errors.age}</small>}
              </div>
              <div className="col-md-6">
                <label>Gender *</label>
                <select
                  className={`form-control ${errors.gender ? 'error' : ''}`}
                  name="gender"
                  value={admissionData.gender}
                  onChange={handleAdmissionChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <small className="text-danger">{errors.gender}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>How did the patient arrive? *</label>
                <select
                  className={`form-control ${errors.arrivalMode ? 'error' : ''}`}
                  name="arrivalMode"
                  value={admissionData.arrivalMode}
                  onChange={handleAdmissionChange}
                >
                  <option value="">Select Arrival Mode</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="On foot">On foot</option>
                  <option value="Other">Other</option>
                </select>
                {errors.arrivalMode && <small className="text-danger">{errors.arrivalMode}</small>}
              </div>
              <div className="col-md-6">
                <label>Is the patient injured? *</label>
                <select
                  className={`form-control ${errors.isInjured ? 'error' : ''}`}
                  name="isInjured"
                  value={admissionData.isInjured}
                  onChange={handleAdmissionChange}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.isInjured && <small className="text-danger">{errors.isInjured}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Mental state of the patient *</label>
                <select
                  className={`form-control ${errors.mentalState ? 'error' : ''}`}
                  name="mentalState"
                  value={admissionData.mentalState}
                  onChange={handleAdmissionChange}
                >
                  <option value="">Select Mental State</option>
                  <option value="Conscious">Conscious</option>
                  <option value="Unconscious">Unconscious</option>
                  <option value="Confused">Confused</option>
                </select>
                {errors.mentalState && <small className="text-danger">{errors.mentalState}</small>}
              </div>
              <div className="col-md-6">
                <label>Does the patient have pain? *</label>
                <select
                  className={`form-control ${errors.hasPain ? 'error' : ''}`}
                  name="hasPain"
                  value={admissionData.hasPain}
                  onChange={handleAdmissionChange}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.hasPain && <small className="text-danger">{errors.hasPain}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Pain scale (0-10) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.painScale ? 'error' : ''}`}
                  name="painScale"
                  value={admissionData.painScale}
                  onChange={handleAdmissionChange}
                />
                {errors.painScale && <small className="text-danger">{errors.painScale}</small>}
              </div>
              <div className="col-md-6">
                <label>Body Temperature (C) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.bodyTemperature ? 'error' : ''}`}
                  name="bodyTemperature"
                  value={admissionData.bodyTemperature}
                  onChange={handleAdmissionChange}
                />
                {errors.bodyTemperature && <small className="text-danger">{errors.bodyTemperature}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Systolic Blood Pressure (mmHg) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.systolicBP ? 'error' : ''}`}
                  name="systolicBP"
                  value={admissionData.systolicBP}
                  onChange={handleAdmissionChange}
                />
                {errors.systolicBP && <small className="text-danger">{errors.systolicBP}</small>}
              </div>
              <div className="col-md-6">
                <label>Diastolic Blood Pressure (mmHg) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.diastolicBP ? 'error' : ''}`}
                  name="diastolicBP"
                  value={admissionData.diastolicBP}
                  onChange={handleAdmissionChange}
                />
                {errors.diastolicBP && <small className="text-danger">{errors.diastolicBP}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Heart Rate (bpm) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.heartRate ? 'error' : ''}`}
                  name="heartRate"
                  value={admissionData.heartRate}
                  onChange={handleAdmissionChange}
                />
                {errors.heartRate && <small className="text-danger">{errors.heartRate}</small>}
              </div>
              <div className="col-md-6">
                <label>Respiration Rate (bpm) *</label>
                <input
                  type="number"
                  className={`form-control ${errors.respirationRate ? 'error' : ''}`}
                  name="respirationRate"
                  value={admissionData.respirationRate}
                  onChange={handleAdmissionChange}
                />
                {errors.respirationRate && <small className="text-danger">{errors.respirationRate}</small>}
              </div>
            </div>
          </fieldset>

          {/* Section 2: Status et zone d'urgence */}
          <fieldset className="mt-3">
            <legend>Status & Emergency Area</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Status *</label>
                <select
                  className={`form-control ${errors.status ? 'error' : ''}`}
                  name="status"
                  value={patient.status}
                  onChange={handlePatientChange}
                >
                  <option value="Triage">Triage</option>
                  <option value="Critical">Critical</option>
                  <option value="Stable">Stable</option>
                  <option value="Recovered">Recovered</option>
                </select>
                {errors.status && <small className="text-danger">{errors.status}</small>}
              </div>
              <div className="col-md-6">
                <label>Emergency Area *</label>
                <input
                  type="text"
                  className={`form-control ${errors.emergencyArea ? 'error' : ''}`}
                  name="emergencyArea"
                  value={patient.emergencyArea}
                  onChange={handlePatientChange}
                />
                {errors.emergencyArea && <small className="text-danger">{errors.emergencyArea}</small>}
              </div>
            </div>
          </fieldset>

          {/* Boutons */}
          <div className="d-flex justify-content-between mt-4">
            <button
              type="button"
              className="btn btn-warning"
              onClick={handleTriageClick}
            >
              Triage
            </button>
            <button type="submit" className="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientTriage;
