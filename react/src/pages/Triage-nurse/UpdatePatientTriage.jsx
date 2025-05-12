// src/components/UpdatePatientTriage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdatePatientTriage.css';

// Calculate age from birth date
const calculateAge = birthDate => {
  const today = new Date(),
        bd    = new Date(birthDate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
};

// Map triage grade to patient status
const mapGradeToStatus = grade => {
  if (grade === 0) return 'Critical';
  if ([1,2,3].includes(grade)) return 'Serious';
  if (grade === 4) return 'Stable';
  return 'Unknown';
};

// Map textual source to codes exactly comme dans ton dataset
const mapSourceToCode = {
  ambulance: 0,
  'walk-in': 1,
  transfer: 2
};

const UpdatePatientTriage = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [formData, setFormData] = useState({
    age: '', gender: '', painScale: '',
    source: 'ambulance', systolicBP: '',
    o2Saturation: '', temperature: ''
  });
  const [loading, setLoading]       = useState(true);
  const [errors, setErrors]         = useState({});
  const [triageResult, setTriageResult] = useState({ grade: null, status: '' });
  const [message, setMessage]       = useState('');

  // Récupère le patient existant
  useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get(`http://localhost:3000/api/patients/${id}`);
        const d = resp.data.data;
        setFormData({
          age: calculateAge(d.birthDate),
          gender: d.sex || d.gender || '',
          painScale: d.painScale || '',
          source: d.source || 'ambulance',
          systolicBP: d.systolicBP || '',
          o2Saturation: d.o2Saturation || '',
          temperature: d.bodyTemperature || ''
        });
      } catch (err) {
        setMessage(`Load error: ${err.response?.data?.error || err.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (v.toString().trim() === '') errs[k] = `Please fill in the ${k} field.`;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // 1) Envoi des valeurs brutes au backend (pipeline s'occupe du scaling)
      const { data } = await axios.post('http://localhost:5000/predict', {
        age: Number(formData.age),
        PainGrade: Number(formData.painScale),
        Source:   mapSourceToCode[formData.source],
        BlooddpressurSystol: Number(formData.systolicBP),
        O2Saturation: Number(formData.o2Saturation)
      });

      const grade  = data.triage_grade;
      const status = mapGradeToStatus(grade);
      setTriageResult({ grade, status });

      // 2) Mise à jour du patient côté Node.js
      await axios.put(`http://localhost:3000/api/patients/${id}`, {
        ...formData,
        triageGrade: grade,
        status
      });

      setMessage(`✅ Triage complete: grade #${grade} → status “${status}” saved.`);
      // navigate('/profile'); // si besoin de rediriger
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Update Patient Triage</h2>

        {triageResult.grade !== null && (
          <div className="alert alert-success">
            🏥 Patient Status: <strong>{triageResult.status}</strong>
          </div>
        )}
        {/*message && <div className="alert alert-info">{message}</div>*/}

        <form onSubmit={handleSubmit} className="row g-3">
          <fieldset>
            <legend>Triage Information</legend>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Age (years) *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  disabled
                  className="form-control"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Pain Scale (0–10) *</label>
                <input
                  type="number"
                  name="painScale"
                  value={formData.painScale}
                  onChange={handleChange}
                  className={`form-control ${errors.painScale ? 'error' : ''}`}
                />
                {errors.painScale && <small className="text-danger">{errors.painScale}</small>}
              </div>
              <div className="col-md-6">
                <label>Source *</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={`form-control ${errors.source ? 'error' : ''}`}
                >
                  <option value="ambulance">ambulance</option>
                  <option value="walk-in">walk-in</option>
                  <option value="transfer">transfer</option>
                </select>
                {errors.source && <small className="text-danger">{errors.source}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Systolic BP (mmHg) *</label>
                <input
                  type="number"
                  name="systolicBP"
                  value={formData.systolicBP}
                  onChange={handleChange}
                  className={`form-control ${errors.systolicBP ? 'error' : ''}`}
                />
                {errors.systolicBP && <small className="text-danger">{errors.systolicBP}</small>}
              </div>
              <div className="col-md-6">
                <label>O₂ Saturation (%) *</label>
                <input
                  type="number"
                  name="o2Saturation"
                  value={formData.o2Saturation}
                  onChange={handleChange}
                  className={`form-control ${errors.o2Saturation ? 'error' : ''}`}
                />
                {errors.o2Saturation && <small className="text-danger">{errors.o2Saturation}</small>}
              </div>
            </div>

            <div className="row mt-2">
              <div className="col-md-6">
                <label>Temperature (°C) *</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className={`form-control ${errors.temperature ? 'error' : ''}`}
                />
                {errors.temperature && <small className="text-danger">{errors.temperature}</small>}
              </div>
            </div>
          </fieldset>

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-primary">
              Update & Triage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientTriage;
