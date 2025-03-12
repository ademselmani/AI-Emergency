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
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        setPatients(data); // Set the fetched data to the state
        sortPatients(sortCriteria, data); // Sort the fetched data
      } catch (error) {
        setError(error.message); // Handle errors
      } finally {
        setLoading(false); // Set loading to false
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
          const aDate = new Date(a.medicalRecords[0]?.date || 0); // Use the first medical record's date
          const bDate = new Date(b.medicalRecords[0]?.date || 0);
          return aDate - bDate;
        });
        break;
      case 'both':
        sortedPatients.sort((a, b) => {
          const aTriage = a.medicalRecords[0]?.triageLevel || 0;
          const bTriage = b.medicalRecords[0]?.triageLevel || 0;
          if (aTriage === bTriage) {
            const aDate = new Date(a.medicalRecords[0]?.date || 0);
            const bDate = new Date(b.medicalRecords[0]?.date || 0);
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
    label: `${patient.name} ${patient.familyName} (Status: ${patient.status}, CIN: ${patient.cin})`,
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
            Date of Medical Record
          </button>
          <button
            className={`btn ${sortCriteria === 'both' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleFilterChange('both')}
          >
            Both (Urgency and Date)
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
              <strong>Name:</strong> {selectedPatient.name} {selectedPatient.familyName}
            </p>
            <p>
              <strong>CIN:</strong> {selectedPatient.cin}
            </p>
            <p>
              <strong>Status:</strong> {selectedPatient.status}
            </p>
            <p>
              <strong>Date of Birth:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
            </p>
            <p>
              <strong>Gender:</strong> {selectedPatient.gender}
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
                <div data-i18n="Analytics">Add medical treatment</div>
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
                <div data-i18n="Analytics">Show current medical treatments</div>
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
              {patient.name} {patient.familyName} (Status: {patient.status}, CIN: {patient.cin})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Treatments;