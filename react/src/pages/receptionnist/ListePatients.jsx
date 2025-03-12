import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListePatients.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patients');
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      if (data.success) {
        setPatients(data.data);
      } else {
        setError('An error occurred while retrieving patients');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this patient?');
    if (confirmDelete) {
      fetch(`http://localhost:3000/api/patients/${id}`, { method: 'DELETE' })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setPatients(patients.filter((patient) => patient._id !== id));
          } else {
            setError('An error occurred while deleting.');
          }
        });
    }
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  const handleEditPatient = (id) => {
    navigate(`/UpdatePatient/${id}`);
  };

  const handleAddPatientClick = () => {
    navigate('/AddPatient');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Critical':
        return 'status-Critical';
      case 'Stable':
        return 'status-Stable';
      case 'Triage':
        return 'status-default';
      case 'Recovered':
        return 'status-Recovered';
      default:
        return 'status-default';
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.emergencyReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.arrivalMode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="patient-list-card">
        <h1>Patient List</h1>

        {/* Search bar */}
        <input 
          type="text" 
          placeholder="Search by name, arrival mode, or emergency reason..." 
          className="search-bar" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />

        {patients.length === 0 ? (
          <div className="patient-list-no-data">No patients found.</div>
        ) : (
          <table className="patient-list-table">
            <thead>
              <tr>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Birth Date</th>
                <th>Arrival Mode</th>
                <th>Emergency Reason</th>
                <th>Emergency Contact</th>
                <th>Status</th>
                <th>Emergency Area</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.lastName}</td>
                  <td>{patient.firstName}</td>
                  <td>{new Date(patient.birthDate).toLocaleDateString()}</td>
                  <td>{patient.arrivalMode}</td>
                  <td>{patient.emergencyReason}</td>
                  <td>{patient.contact.name} ({patient.contact.relation})</td>
                  <td>
                    {/* Blinking status circle */}
                    <div className={`status-circle ${getStatusClass(patient.status)}`}></div>
                    <span className={getStatusClass(patient.status)}>{patient.status}</span>
                  </td>
                  <td>{patient.emergencyArea}</td>
                  <td>
                    <button className="details" onClick={() => handleViewDetails(patient)}>Details</button>
                    <button className="edit" onClick={() => handleEditPatient(patient._id)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(patient._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="patient-list-button" onClick={handleAddPatientClick}>Add Patient</button>
        {selectedPatient && (
  <div className="patient-details">
    <h2>Patient Details</h2>
    <p><strong>Last Name:</strong> {selectedPatient.lastName}</p>
    <p><strong>First Name:</strong> {selectedPatient.firstName}</p>
    <p><strong>Birth Date:</strong> {new Date(selectedPatient.birthDate).toLocaleDateString()}</p>
    <p><strong>Arrival Mode:</strong> {selectedPatient.arrivalMode}</p>
    <p><strong>Emergency Reason:</strong> {selectedPatient.emergencyReason}</p>
    <p><strong>Emergency Contact:</strong> {selectedPatient.contact.name} ({selectedPatient.contact.relation})</p>
    
    {/* Status section with blinking circle */}
    <p>
      <strong>Status:</strong>
      <div className={`status-circle ${getStatusClass(selectedPatient.status)}`}></div>
      <span className={getStatusClass(selectedPatient.status)}>{selectedPatient.status}</span>
    </p>
    
    <p><strong>Emergency Area:</strong> {selectedPatient.emergencyArea}</p>
    <p><strong>Observations:</strong> {selectedPatient.observations}</p>
  </div>
)}

      </div>
    </div>
  );
};

export default PatientList;
