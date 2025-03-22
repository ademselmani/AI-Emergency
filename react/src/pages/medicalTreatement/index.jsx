import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Select from 'react-select'; // Import react-select
import { NavLink } from 'react-router-dom';

const Treatments = () => {
  const [patients, setPatients] = useState([]); // State to store the list of patients
  const [selectedPatient, setSelectedPatient] = useState(null); // State to store the selected patient
  const [sortCriteria, setSortCriteria] = useState('urgency'); // State to store the sorting criteria
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors

  // Fetch patients from the API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/patients');
        const data = await response.json();

        console.log("Raw API Response:", data); // Verify structure of received data

        if (!Array.isArray(data.data)) { // Verify that `data.data` is an array
          throw new Error('Data received is not an array');
        }

        setPatients(data.data); // Use `data.data`
        sortPatients(sortCriteria, data.data); // Sort with the correct array
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []); // Empty dependency array to run only once on mount

  // Sort patients based on the selected criteria
  const sortPatients = (criteria, patientsData) => {
    let sortedPatients = [...patientsData];

    switch (criteria) {
      case 'urgency':
        sortedPatients.sort((a, b) => {
          const aTriage = a.medicalRecords[0]?.triageLevel || 0; // Use the first medical record's triage level
          const bTriage = b.medicalRecords[0]?.triageLevel || 0;
          return aTriage - bTriage;
        });
        break;
      case 'date':
        sortedPatients.sort((a, b) => {
          const aDate = new Date(a.arrivalTime || 0); // Use arrival time for sorting
          const bDate = new Date(b.arrivalTime || 0);
          return aDate - bDate;
        });
        break;
      case 'both':
        sortedPatients.sort((a, b) => {
          const aTriage = a.medicalRecords[0]?.triageLevel || 0;
          const bTriage = b.medicalRecords[0]?.triageLevel || 0;
          if (aTriage === bTriage) {
            const aDate = new Date(a.arrivalTime || 0);
            const bDate = new Date(b.arrivalTime || 0);
            return aDate - bDate;
          }
          return aTriage - bTriage;
        });
        break;
      default:
        break;
    }

    setPatients(sortedPatients);
  };

  // Handle filter change
  const handleFilterChange = (criteria) => {
    setSortCriteria(criteria);
    sortPatients(criteria, patients);
  };

  // Handle patient selection
  const handlePatientSelect = (selectedOption) => {
    setSelectedPatient(selectedOption ? selectedOption.value : null);
  };

  // Format patients for react-select
  const patientOptions = patients.map((patient) => ({
    value: patient,
    label: `${patient.firstName} ${patient.lastName} (Status: ${patient.status}, Phone: ${patient.phone})`,
  }));

  // Display loading or error messages
  if (loading) {
    return <div className="container text-center mt-4">Loading...</div>;
  }

  if (error) {
    return <div className="container text-center mt-4 text-danger">Error: {error}</div>;
  }

  return (
    <div className="container card p-3">
      <h1 className="text-center mb-4">Assign Medical Treatment</h1>

      {/* Filter Options */}
      <div className="mb-4">
        <h2>Sort By</h2>
        <div className="btn-group" role="group">
          <button
            className={`btn ${sortCriteria === 'urgency' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('urgency')}
          >
            Urgency
          </button>
          <button
            className={`btn ${sortCriteria === 'date' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('date')}
          >
            Arrival Time
          </button>
          <button
            className={`btn ${sortCriteria === 'both' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('both')}
          >
            Both (Urgency and Arrival Time)
          </button>
        </div>
      </div>

      {/* Step 1: Ask which patient the treatment will be assigned to */}
      <div className="mb-4">
        <h2>Select a Patient</h2>
        <Select
          options={patientOptions}
          onChange={handlePatientSelect}
          placeholder="Search for a patient..."
          isSearchable // Enable search functionality
          isClearable // Allow clearing the selection
        />
      </div>

      {/* Step 2: Display the selected patient */}
      {selectedPatient && (
        <div className="card mb-4">
          <div className="card-body">
            <h2 className="card-title">Selected Patient</h2>
            <p>
              <strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}
            </p>
            <p>
              <strong>Birth Date:</strong> {new Date(selectedPatient.birthDate).toLocaleDateString()}
            </p>
            <p>
              <strong>Sex:</strong> {selectedPatient.sex}
            </p>
            <p>
              <strong>Phone:</strong> {selectedPatient.phone}
            </p>
            <p>
              <strong>Arrival Mode:</strong> {selectedPatient.arrivalMode}
            </p>
            <p>
              <strong>Emergency Reason:</strong> {selectedPatient.emergencyReason}
            </p>
            <p>
              <strong>Observations:</strong> {selectedPatient.observations}
            </p>
            <p>
              <strong>Emergency Area:</strong> {selectedPatient.emergencyArea}
            </p>
            <p>
              <strong>Arrival Time:</strong> {new Date(selectedPatient.arrivalTime).toLocaleString()}
            </p>
            <span className="text-center" style={{ display: 'flex', justifyContent: 'center' }}>
              <NavLink
                to={`/medical-treatments/patient/add/${selectedPatient._id}`}
                state={{ patient: selectedPatient }}
                className={({ isActive }) =>
                  `menu-link btn btn-outline-success ${isActive ? 'active' : ''}`
                }
                style={{ width: 'fit-content' }}
              >
                <i className="menu-icon tf-icons bx bx-plus"></i>
                <div data-i18n="Analytics">Add Medical Monitoring</div>
              </NavLink>
              <NavLink
                to={`/medical-treatments/patient/show/${selectedPatient._id}`}
                state={{ patient: selectedPatient }}
                className={({ isActive }) =>
                  `menu-link btn btn-outline-info ${isActive ? 'active' : ''}`
                }
                style={{ width: 'fit-content' }}
              >
                <i className="menu-icon tf-icons bx bx-band-aid"></i>
                <div data-i18n="Analytics">Show Current Medical Monitoring</div>
              </NavLink>
            </span>
          </div>
        </div>
      )}

      {/* Step 3: List all patients sorted by the selected criteria */}
      <div>
        <h2>Patients List</h2>
        <ul className="list-group">
          {patients.map((patient) => (
            <li key={patient._id} className="list-group-item">
              {patient.firstName} {patient.lastName} (Status: {patient.status}, Phone: {patient.phone})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Treatments;