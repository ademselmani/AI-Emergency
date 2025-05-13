import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdatePatientTriage.css';

const calculateAge = birthDate => {
  const today = new Date(),
        bd = new Date(birthDate);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return age;
};

const mapGradeToStatus = grade => {
  if (grade === 0) return 'Critical';
  if ([1,2,3].includes(grade)) return 'Serious';
  if (grade === 4) return 'Stable';
  return 'Unknown';
};

const mapSourceToCode = {
  ambulance: 0,
  'walk-in': 1,
  transfer: 2
};

// Description des clusters (à adapter selon vos données)
const CLUSTER_DESCRIPTIONS = {
  0: "Patients à faible risque",
  1: "Patients à risque modéré",
  2: "Patients à haut risque",
  3: "Patients critiques"
};

const UpdatePatientTriage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: '', gender: '', painScale: '',
    source: 'ambulance', systolicBP: '',
    o2Saturation: '', temperature: ''
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [triageResult, setTriageResult] = useState({ grade: null, status: '' });
  const [clusterResult, setClusterResult] = useState({ cluster: null, distances: [] });
  const [lengthOfStay, setLengthOfStay] = useState(null);
  const [message, setMessage] = useState('');

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
      // Envoi des données en parallèle pour meilleure performance
      const [triageResponse, clusterResponse, losResponse] = await Promise.all([
        axios.post('http://localhost:5000/predict', {
          age: Number(formData.age),
          PainGrade: Number(formData.painScale),
          Source: mapSourceToCode[formData.source],
          BlooddpressurSystol: Number(formData.systolicBP),
          O2Saturation: Number(formData.o2Saturation)
        }),
        axios.post('http://localhost:5000/cluster', {
          age: Number(formData.age),
          PainGrade: Number(formData.painScale),
          Source: mapSourceToCode[formData.source],
          BlooddpressurSystol: Number(formData.systolicBP),
          O2Saturation: Number(formData.o2Saturation)
        }),
        axios.post('http://localhost:5000/predict_los', {
          age: Number(formData.age),
          PainGrade: Number(formData.painScale),
          Source: mapSourceToCode[formData.source],
          BlooddpressurSystol: Number(formData.systolicBP),
          O2Saturation: Number(formData.o2Saturation)
        })
      ]);

      const grade = triageResponse.data.triage_grade;
      const status = mapGradeToStatus(grade);
      setTriageResult({ grade, status });
      setClusterResult({
        cluster: clusterResponse.data.cluster,
        distances: clusterResponse.data.distances
      });
      setLengthOfStay(losResponse.data.length_of_stay);

      // Mise à jour du patient
      await axios.put(`http://localhost:3000/api/patients/${id}`, {
        ...formData,
        triageGrade: grade,
        status,
        cluster: clusterResponse.data.cluster
      });

      setMessage(`✅ Triage complete: ${status} (Grade ${grade}) | Cluster ${clusterResponse.data.cluster}`);
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading patient data...</div>;

  return (
    <div className="container">
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Patient Triage Assessment</h2>

        {(triageResult.grade !== null || clusterResult.cluster !== null || lengthOfStay !== null) && (
          <div className="alert alert-success">
            {triageResult.grade !== null && (
              <div>
                <strong>🏥 Triage Status:</strong> {triageResult.status} (Grade {triageResult.grade})
              </div>
            )}
            {clusterResult.cluster !== null && (
              <div className="mt-2">
                <strong>📊 Patient Cluster:</strong> {clusterResult.cluster} 
              </div>
            )}
            {lengthOfStay !== null && (
              <div className="mt-2">
                <strong>🛏️ Estimated Length of Stay:</strong> {lengthOfStay} days
              </div>
            )}
          </div>
        )}

        {message && !triageResult.grade && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-info'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="row g-3">
          <fieldset>
            <legend>Patient Information</legend>

            <div className="row mt-3">
              <div className="col-md-6">
                <label className="form-label">Age (years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
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
          </fieldset>

          <fieldset className="mt-4">
            <legend>Clinical Parameters</legend>

            <div className="row mt-3">
              <div className="col-md-6">
                <label className="form-label">Pain Scale (0-10)*</label>
                <input
                  type="number"
                  name="painScale"
                  min="0"
                  max="10"
                  value={formData.painScale}
                  onChange={handleChange}
                  className={`form-control ${errors.painScale ? 'is-invalid' : ''}`}
                  required
                />
                {errors.painScale && <div className="invalid-feedback">{errors.painScale}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Arrival Source*</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={`form-control ${errors.source ? 'is-invalid' : ''}`}
                  required
                >
                  <option value="ambulance">Ambulance</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-4">
                <label className="form-label">Systolic BP (mmHg)*</label>
                <input
                  type="number"
                  name="systolicBP"
                  value={formData.systolicBP}
                  onChange={handleChange}
                  className={`form-control ${errors.systolicBP ? 'is-invalid' : ''}`}
                  required
                />
                {errors.systolicBP && <div className="invalid-feedback">{errors.systolicBP}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">O2 Saturation (%)</label>
                <input
                  type="number"
                  name="o2Saturation"
                  value={formData.o2Saturation}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Body Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </fieldset>

          <div className="row justify-content-center mt-4">
            <button 
              className="btn" 
              type="submit"
              style={{
                backgroundColor: '#ff3b3f',
                color: 'white',
                padding: '0.375rem 0.75rem',
                fontSize: '0.875rem',
                width: 'auto'
              }}
            >
              Submit Triage Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientTriage;