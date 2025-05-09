import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from 'react-select';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, PlusCircle, Stethoscope } from 'lucide-react';

const Treatments = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('urgency');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/patients');
        const data = await response.json();

        if (!Array.isArray(data.data)) throw new Error('Data received is not an array');

        setPatients(data.data);
        sortPatients(sortCriteria, data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const sortPatients = (criteria, patientsData) => {
    let sorted = [...patientsData];
    switch (criteria) {
      case 'urgency':
        sorted.sort((a, b) => (a.medicalRecords[0]?.triageLevel || 0) - (b.medicalRecords[0]?.triageLevel || 0));
        break;
      case 'date':
        sorted.sort((a, b) => new Date(a.arrivalTime || 0) - new Date(b.arrivalTime || 0));
        break;
      case 'both':
        sorted.sort((a, b) => {
          const triageDiff = (a.medicalRecords[0]?.triageLevel || 0) - (b.medicalRecords[0]?.triageLevel || 0);
          if (triageDiff !== 0) return triageDiff;
          return new Date(a.arrivalTime || 0) - new Date(b.arrivalTime || 0);
        });
        break;
      default:
        break;
    }
    setPatients(sorted);
  };

  const handleFilterChange = (criteria) => {
    setSortCriteria(criteria);
    sortPatients(criteria, patients);
  };

  const handlePatientSelect = (selectedOption) => {
    setSelectedPatient(selectedOption ? selectedOption.value : null);
  };

  const patientOptions = patients.map((p) => ({
    value: p,
    label: `${p.firstName} ${p.lastName} (Status: ${p.status}, Phone: ${p.phone})`,
  }));

  if (loading) return <div className="container text-center mt-5">⏳ Loading patients...</div>;
  if (error) return <div className="container text-center text-danger mt-5">❌ Error: {error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="treatments-container"
    >
      <div className="treatments-card">
        <h1 className="treatments-title">
          <Stethoscope size={28} className="title-icon" /> Assign Medical Treatment
        </h1>

        {/* Filter Buttons */}
        <div className="filter-section">
          <h5>Sort Patients By</h5>
          <div className="filter-buttons">
            {['urgency', 'date', 'both'].map((crit) => (
              <button
                key={crit}
                className={`filter-button ${sortCriteria === crit ? 'active' : ''}`}
                onClick={() => handleFilterChange(crit)}
              >
                {crit.charAt(0).toUpperCase() + crit.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Select a patient */}
        <div className="patient-select-section">
          <h5>Select a Patient</h5>
          <Select
            options={patientOptions}
            onChange={handlePatientSelect}
            placeholder="🔍 Search patient by name, phone or status"
            isSearchable
            isClearable
            className="patient-select"
            classNamePrefix="select"
          />
        </div>

        {/* Display selected patient */}
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="patient-detail-card"
          >
            <div className="patient-detail-content">
              <h5 className="patient-name">
                <User size={20} className="patient-icon" /> {selectedPatient.firstName} {selectedPatient.lastName}
              </h5>
              <ul className="patient-info-list">
                <li><strong>Birth Date:</strong> {new Date(selectedPatient.birthDate).toLocaleDateString()}</li>
                <li><strong>Sex:</strong> {selectedPatient.sex}</li>
                <li><strong>Phone:</strong> {selectedPatient.phone}</li>
                <li><strong>Arrival Mode:</strong> {selectedPatient.arrivalMode}</li>
                <li><strong>Emergency Reason:</strong> {selectedPatient.emergencyReason}</li>
                <li><strong>Observations:</strong> {selectedPatient.observations}</li>
                <li><strong>Emergency Area:</strong> {selectedPatient.emergencyArea}</li>
                <li><strong>Arrival Time:</strong> {new Date(selectedPatient.arrivalTime).toLocaleString()}</li>
              </ul>
              <div className="action-buttons">
                <NavLink
                  to={`/medical-treatments/patient/add/${selectedPatient._id}`}
                  state={{ patient: selectedPatient }}
                  className="action-button add-button"
                >
                  <PlusCircle size={18} className=" " /> Add Monitoring
                </NavLink>
                <NavLink
                  to={`/medical-treatments/patient/show/${selectedPatient._id}`}
                  state={{ patient: selectedPatient }}
                  className="action-button view-button"
                >
                  <Stethoscope size={18} className="button-icon" /> View Monitoring
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}

        {/* Patient List */}
        <div className="patient-list-section">
          <h5>📋 Sorted Patient List</h5>
          <ul className="patient-list">
            {patients.map((p) => (
              <li 
                key={p._id} 
                className="patient-list-item"
              >
                <span className="patient-name">
                  {p.firstName} {p.lastName}
                </span>
                <span className="patient-status">
                  {p.status} | {p.phone}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
  .treatments-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .treatments-card {
    background:rgb(255, 255, 255);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(255, 140, 105, 0.1);
    border: 1px solid #ffe5dd;
  }

  .treatments-title {
    color: #5c2c22;
    text-align: center;
    margin-bottom: 2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    font-size: 1.75rem;
  }

  .title-icon {
    color: #FF8C69;
  }

  .filter-section {
    margin-bottom: 2rem;
  }

  .filter-section h5 {
    color: #8c5d55;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .filter-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .filter-button {
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    background: #fff0eb;
    border: 1px solid #ffd6cc;
    color: #8c5d55;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-button:hover {
    background: #ffe5dd;
        color: white;

    border-color: #ffb8a6;
  }

  .filter-button.active {
    background: #FF8C69;
    color: white;
    border-color: #FF8C69;
  }

  .patient-select-section {
    margin-bottom: 2rem;
  }

  .patient-select-section h5 {
    color: #8c5d55;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .patient-detail-card {
    background: #fff9f7;
    border-radius: 10px;
    margin-bottom: 2rem;
    border: 1px solid #ffe5dd;
    box-shadow: 0 2px 10px rgba(255, 140, 105, 0.05);
    overflow: hidden;
  }

  .patient-detail-content {
    padding: 1.5rem;
  }

  .patient-name {
    color: #5c2c22;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .patient-icon {
    color: #8c5d55;
  }

  .patient-info-list {
    color: #8c5d55;
    padding: 0;
    margin: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  .patient-info-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #fff0eb;
  }

  .patient-info-list li strong {
    color: #5c2c22;
    font-weight: 500;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
    flex-wrap: wrap;
  }

  .action-button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .add-button {
    background: #FF8C69;
    color: white;

  }

  .add-button:hover {
    background: #e67d5b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 140, 105, 0.3);
        color: white;

  }

  .view-button {
    background: white;
    color: #FF8C69;
    
    border: 1px solid #FF8C69;
  }

  .view-button:hover {
    background: #fff0eb;
    color: #FF8C69;

    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 140, 105, 0.2);
  }

  .button-icon {
    margin-right: 0.25rem;
  }

  .patient-list-section h5 {
    color: #8c5d55;
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .patient-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .patient-list-item {
    background: #fff9f7;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    border: 1px solid #ffe5dd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
  }

  .patient-list-item:hover {
    background: #fff0eb;
    border-color: #FF8C69;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 140, 105, 0.05);
  }

  .patient-name {
    color: #5c2c22;
    font-weight: 500;
  }

  .patient-status {
    background: #fff0eb;
    color: #FF8C69;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  /* Custom styles for react-select */
  :global(.select__control) {
    border-radius: 8px !important;
    border: 1px solid #ffe5dd !important;
    min-height: 44px !important;
    box-shadow: none !important;
    background: #fff9f7 !important;
  }

  :global(.select__control--is-focused) {
    border-color: #FF8C69 !important;
    box-shadow: 0 0 0 1px #FF8C69 !important;
  }

  :global(.select__option--is-focused) {
    background-color: #fff0eb !important;
  }

  :global(.select__option--is-selected) {
    background-color: #FF8C69 !important;
  }

  @media (max-width: 768px) {
    .treatments-container {
      padding: 1rem;
    }
    
    .treatments-card {
      padding: 1.5rem;
    }
    
    .filter-buttons {
      flex-wrap: wrap;
    }
    
    .patient-info-list {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
`}</style>
    </motion.div>
  );
};

export default Treatments;
