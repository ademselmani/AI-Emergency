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
      className="container my-5"
    >
      <div className="card shadow-lg p-4">
        <h1 className="text-center mb-4 display-6 text-primary"><Stethoscope size={28} /> Assign Medical Treatment</h1>

        {/* Filter Buttons */}
        <div className="mb-4">
          <h5>Sort Patients By</h5>
          <div className="btn-group">
            {['urgency', 'date', 'both'].map((crit) => (
              <button
                key={crit}
                className={`btn ${sortCriteria === crit ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleFilterChange(crit)}
              >
                {crit.charAt(0).toUpperCase() + crit.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Select a patient */}
        <div className="mb-4">
          <h5>Select a Patient</h5>
          <Select
            options={patientOptions}
            onChange={handlePatientSelect}
            placeholder="🔍 Search patient by name, phone or status"
            isSearchable
            isClearable
          />
        </div>

        {/* Display selected patient */}
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card mb-4 border-info shadow-sm"
          >
            <div className="card-body">
              <h5 className="card-title text-info"><User size={20} /> {selectedPatient.firstName} {selectedPatient.lastName}</h5>
              <ul className="list-unstyled mt-3">
                <li><strong>Birth Date:</strong> {new Date(selectedPatient.birthDate).toLocaleDateString()}</li>
                <li><strong>Sex:</strong> {selectedPatient.sex}</li>
                <li><strong>Phone:</strong> {selectedPatient.phone}</li>
                <li><strong>Arrival Mode:</strong> {selectedPatient.arrivalMode}</li>
                <li><strong>Emergency Reason:</strong> {selectedPatient.emergencyReason}</li>
                <li><strong>Observations:</strong> {selectedPatient.observations}</li>
                <li><strong>Emergency Area:</strong> {selectedPatient.emergencyArea}</li>
                <li><strong>Arrival Time:</strong> {new Date(selectedPatient.arrivalTime).toLocaleString()}</li>
              </ul>
              <div className="d-flex gap-3 justify-content-center mt-3">
                <NavLink
                  to={`/medical-treatments/patient/add/${selectedPatient._id}`}
                  state={{ patient: selectedPatient }}
                  className="btn btn-success d-flex align-items-center gap-1"
                >
                  <PlusCircle size={18} /> Add Monitoring
                </NavLink>
                <NavLink
                  to={`/medical-treatments/patient/show/${selectedPatient._id}`}
                  state={{ patient: selectedPatient }}
                  className="btn btn-outline-info d-flex align-items-center gap-1"
                >
                  <Stethoscope size={18} /> View Monitoring
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}

        {/* Patient List */}
        <div>
          <h5>📋 Sorted Patient List</h5>
          <ul className="list-group">
            {patients.map((p) => (
              <li key={p._id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  {p.firstName} {p.lastName}
                </span>
                <span className="badge bg-secondary">
                  {p.status} | {p.phone}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Treatments;
