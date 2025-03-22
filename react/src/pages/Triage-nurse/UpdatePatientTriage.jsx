import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpdatePatientTriage.css';

const UpdatePatientTriage = () => {
  const { id } = useParams(); // Retrieve patient ID from URL
  const navigate = useNavigate();
  const [patient, setPatient] = useState({
    status: 'Triage',
    emergencyArea: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3000/api/patients/${id}`)
        .then(response => {
          setPatient(response.data.data); // Update patient state with relevant data
          setLoading(false);
        })
        .catch(error => {
          setMessage(`Error: ${error.response?.data?.error || error.message}`);
          setLoading(false);
        });
    }
  }, [id]); // Retrieve data each time ID changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update patient status and emergency area in the database
      await axios.put(`http://localhost:3000/api/patients/${id}`, {
        status: patient.status,
        emergencyArea: patient.emergencyArea
      });
      setMessage('Patient status and emergency area successfully updated!');
      setTimeout(() => navigate('/profile'), 2000); // Redirect after success
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
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
          {/* Section 1: Status and Emergency Area */}
          <fieldset>
            <legend>Status & Emergency Area</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Status:</label>
                <select className="form-control" name="status" value={patient.status} onChange={handleChange} required>
                  <option value="Triage">Triage</option>
                  <option value="Critical">Critical</option>
                  <option value="Stable">Stable</option>
                  <option value="Recovered">Recovered</option>
                </select>
              </div>
              <div className="col-md-6">
                <label>Emergency Area:</label>
                <input type="text" className="form-control" name="emergencyArea" value={patient.emergencyArea} onChange={handleChange} required />
              </div>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary w-100 mt-3">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientTriage;
