
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListePatients.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      data.success ? setPatients(data.data) : setError('Error retrieving patients');
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleDelete = (id) => {
    if (window.confirm('Delete this patient?')) {
      fetch(`http://localhost:3000/api/patients/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => data.success && setPatients(patients.filter(p => p._id !== id)));
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      Critical: { color: '#dc3545', bg: '#f8d7da' },
      Stable: { color: '#28a745', bg: '#d4edda' },
      Triage: { color: '#ffc107', bg: '#fff3cd' },
      Recovered: { color: '#17a2b8', bg: '#d1ecf1' }
    };
    return styles[status] || { color: '#6c757d', bg: '#f8f9fa' };
  };

  const filteredPatients = patients.filter(patient =>
    Object.values(patient).some(value =>
      typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="patient-management">
      <div className="header">
        <h1>Patient Dashboard</h1>
        <div className="controls">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <button className="primary-button" onClick={() => navigate('/AddPatient')}>
            + New Patient
          </button>
        </div>
      </div>

      <div className="patient-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date of Birth</th>
              <th>Arrival Mode</th>
              <th>Emergency Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(patient => (
              <tr key={patient._id}>
                <td>
                  <div className="patient-name">
                    {`${patient.firstName} ${patient.lastName}`}
                  </div>
                </td>
                <td>{new Date(patient.birthDate).toLocaleDateString()}</td>
                <td>{patient.arrivalMode}</td>
                <td className="emergency-reason">{patient.emergencyReason}</td>
                <td className="status">{patient.status}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-button info"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </button>
                    <button 
                      className="icon-button warning"
                      onClick={() => navigate(`/UpdatePatient/${patient._id}`)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                    <button 
                      className="icon-button danger"
                      onClick={() => handleDelete(patient._id)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!filteredPatients.length && (
          <div className="empty-state">
            <img src="/empty-state.svg" alt="No patients" />
            <p>No patients found</p>
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="modal-overlay">
          <div className="patient-modal">
            <div className="modal-header">
              <h2>Patient Details</h2>
              <button 
                className="close-button"
                onClick={() => setSelectedPatient(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <div className="detail-row">
                  <span>Full Name:</span>
                  <p>{`${selectedPatient.firstName} ${selectedPatient.lastName}`}</p>
                </div>
                <div className="detail-row">
                  <span>Date of Birth:</span>
                  <p>{new Date(selectedPatient.birthDate).toLocaleDateString()}</p>
                </div>
                <div className="detail-row">
                  <span>Emergency Contact:</span>
                  <p>{`${selectedPatient.contact.name} (${selectedPatient.contact.relation})`}</p>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-row">
                  <span>Arrival Mode:</span>
                  <p>{selectedPatient.arrivalMode}</p>
                </div>
                <div className="detail-row">
                  <span>Emergency Reason:</span>
                  <p>{selectedPatient.emergencyReason}</p>
                </div>
                <div className="detail-row">
                  <span>Emergency Area:</span>
                  <p>{selectedPatient.emergencyArea}</p>
                </div>
              </div>

              <div className="detail-section">
                <div className="status-display">
                  <span>Current Status:</span>
                  <div className="status-indicator" style={{
                    backgroundColor: getStatusStyle(selectedPatient.status).bg,
                    color: getStatusStyle(selectedPatient.status).color
                  }}>
                    {selectedPatient.status}
                  </div>
                </div>
                <div className="observations">
                  <h4>Medical Observations</h4>
                  <p>{selectedPatient.observations || 'No observations recorded'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
