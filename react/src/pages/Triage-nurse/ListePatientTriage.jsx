import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListePatientTriage.css';
import filterIcon from "../../../public/assets/img/icons/unicons/filter.svg"; // Adjust the path accordingly

const ListePatientTriage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchPatients();
  }, []);

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
  };

  const handleEditPatient = (id) => {
    navigate(`/UpdatePatientTriage/${id}`);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Critical': return 'status-Critical';
      case 'Stable': return 'status-Stable';
      case 'Triage': return 'status-default';
      case 'Serious': return 'status-Serious';
      default: return 'status-default';
    }
  };

  // Function to calculate age based on birthDate
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth();
    if (month < birthDateObj.getMonth() || (month === birthDateObj.getMonth() && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

let filteredPatients = patients
  .filter(patient => patient.status === 'Triage')
  .filter(patient =>
    (patient.firstName && typeof patient.firstName === 'string' && patient.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.lastName && typeof patient.lastName === 'string' && patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.emergencyReason && typeof patient.emergencyReason === 'string' && patient.emergencyReason.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.arrivalMode && typeof patient.arrivalMode === 'string' && patient.arrivalMode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (sortOption === 'recent') {
    filteredPatients.sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate));
  } else if (sortOption === 'oldest') {
    filteredPatients.sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate));
  } else if (sortOption === 'name-asc') {
    filteredPatients.sort((a, b) => a.lastName.localeCompare(b.lastName));
  } else if (sortOption === 'name-desc') {
    filteredPatients.sort((a, b) => b.lastName.localeCompare(a.lastName));
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="patient-list-container">
      <div className="patient-list-card">
        <h1>Patient List</h1>

        {/* Search and Filter Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, arrival mode, or emergency reason..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter Button */}
          <div className={`filter-container ${isFilterOpen ? 'active' : ''}`}>
            <button className="filter-button" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <img src={filterIcon} alt="Filtrer" /> Filtrer
            </button>

            {/* Dropdown Filter Menu */}
            {isFilterOpen && (
              <ul className="filter-dropdown">
                <li onClick={() => { setSortOption('recent'); setIsFilterOpen(false); }}>Plus récent</li>
                <li onClick={() => { setSortOption('oldest'); setIsFilterOpen(false); }}>Plus ancien</li>
                <li onClick={() => { setSortOption('name-asc'); setIsFilterOpen(false); }}>Nom (A-Z)</li>
                <li onClick={() => { setSortOption('name-desc'); setIsFilterOpen(false); }}>Nom (Z-A)</li>
              </ul>
            )}
          </div>
        </div>

        {filteredPatients.length === 0 ? (
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
                <th>Status</th>
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
                  <td>
                    <div className={`status-circle ${getStatusClass(patient.status)}`}></div>
                    <span className={getStatusClass(patient.status)}>{patient.status}</span>
                  </td>
                  <td>
                    <button className="details" onClick={() => handleViewDetails(patient)}>Details</button>
                    <button className="edit" onClick={() => handleEditPatient(patient._id)}>Triage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {selectedPatient && (
          <div className="patient-details">
            <h2>Patient Details</h2>
            <p><strong>Last Name:</strong> {selectedPatient.lastName}</p>
            <p><strong>First Name:</strong> {selectedPatient.firstName}</p>
            <p><strong>Age:</strong> {calculateAge(selectedPatient.birthDate)} years</p>
            <p><strong>Arrival Mode:</strong> {selectedPatient.arrivalMode}</p>
            <p><strong>Emergency Reason:</strong> {selectedPatient.emergencyReason}</p>
            <p><strong>Observations:</strong> {selectedPatient.observations}</p>

            <p><strong>Insurance Information:</strong></p>
            <p>Blood: {selectedPatient.insurance.cardNumber || 'Not Provided'}</p>
            <p>Sucre: {selectedPatient.insurance.provider || 'Not Provided'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListePatientTriage;
