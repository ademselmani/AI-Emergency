import React, { useState } from 'react';
import axios from 'axios';
import "./AddPatientForm.css";

const AddPatientForm = () => {
  const [patient, setPatient] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    sex: '',
    phone: '',
    arrivalMode: 'Ambulance',
    emergencyReason: '',
    insurance: { cardNumber: '', provider: '' },
    contact: { name: '', relation: '', phone: '', email: '' },
    observations: '',
    status: 'Triage',   // Translation of "En attente"
    emergencyArea: ''    // Translation of "Zone d'urgence"
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient(prevState => ({ ...prevState, [name]: value }));
  };

  const handleNestedChange = (e, parent) => {
    const { name, value } = e.target;
    setPatient(prevState => ({
      ...prevState,
      [parent]: { ...prevState[parent], [name]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the form data to the backend
      await axios.post('http://localhost:3000/api/patients', patient);
      setMessage('Patient added successfully!');
      setPatient({
        firstName: '',
        lastName: '',
        birthDate: '',
        birthPlace: '',
        sex: '',
        phone: '',
        arrivalMode: 'Ambulance',  // Reset to default value
        emergencyReason: '',
        insurance: { cardNumber: '', provider: '' },
        contact: { name: '', relation: '', phone: '', email: '' },
        observations: '',
        status: 'Triage',  // Reset status
        emergencyArea: ''   // Reset emergency area
      });
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Add Patient</h2>
        
        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit} className="row g-3">
          {/* Section 1: Personal Information */}
          <fieldset>
            <legend>Personal Information</legend>
            <div className="row">
              <div className="col-md-6">
                <label>First Name:</label>
                <input type="text" className="form-control" name="firstName" value={patient.firstName} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label>Last Name:</label>
                <input type="text" className="form-control" name="lastName" value={patient.lastName} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label>Birth Date:</label>
                <input type="date" className="form-control" name="birthDate" value={patient.birthDate} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label>Birth Place:</label>
                <input type="text" className="form-control" name="birthPlace" value={patient.birthPlace} onChange={handleChange} />
              </div>

              <div className="col-md-6">
                <label>Sex:</label>
                <select className="form-control" name="sex" value={patient.sex} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label>Phone Number:</label>
                <input type="text" className="form-control" name="phone" value={patient.phone} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          {/* Section 2: Arrival Mode & Emergency */}
          <fieldset>
            <legend>Arrival Mode & Emergency</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Arrival Mode:</label>
                <select className="form-control" name="arrivalMode" value={patient.arrivalMode} onChange={handleChange} required>
                  <option value="Ambulance">Ambulance</option>
                  <option value="On foot">On foot</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-md-6">
                <label>Emergency Reason:</label>
                <input type="text" className="form-control" name="emergencyReason" value={patient.emergencyReason} onChange={handleChange} required />
              </div>

              {/* New field: Status */}
              <div className="col-md-6">
                <label>Status:</label>
                <select className="form-control" name="status" value={patient.status} onChange={handleChange} required>
                  <option value="Triage">Triage</option>
                  <option value="Critical">Critical</option>
                  <option value="Stable">Stable</option>
                  <option value="Recovered">Recovered</option>
                </select>
              </div>

              {/* New field: Emergency Area */}
              <div className="col-md-6">
                <label>Emergency Area:</label>
                <input type="text" className="form-control" name="emergencyArea" value={patient.emergencyArea} onChange={handleChange} required />
              </div>
            </div>
          </fieldset>

          {/* Section 3: Insurance Information (only visible if arrival mode is Ambulance) */}
          {patient.arrivalMode === 'Ambulance' && (
            <fieldset>
              <legend>Insurance Information</legend>
              <div className="row">
                <div className="col-md-6">
                  <label>Card Number:</label>
                  <input type="text" className="form-control" name="cardNumber" value={patient.insurance.cardNumber} onChange={(e) => handleNestedChange(e, 'insurance')} />
                </div>

                <div className="col-md-6">
                  <label>Provider:</label>
                  <input type="text" className="form-control" name="provider" value={patient.insurance.provider} onChange={(e) => handleNestedChange(e, 'insurance')} />
                </div>
              </div>
            </fieldset>
          )}

          {/* Section 4: Emergency Contact */}
          <fieldset>
            <legend>Emergency Contact</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Name:</label>
                <input type="text" className="form-control" name="name" value={patient.contact.name} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>

              <div className="col-md-6">
                <label>Relation:</label>
                <input type="text" className="form-control" name="relation" value={patient.contact.relation} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>

              <div className="col-md-6">
                <label>Phone:</label>
                <input type="text" className="form-control" name="phone" value={patient.contact.phone} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>

              <div className="col-md-6">
                <label>Email:</label>
                <input type="email" className="form-control" name="email" value={patient.contact.email} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>
            </div>
          </fieldset>

          {/* Section 5: Observations */}
          <fieldset>
            <legend>Observations</legend>
            <textarea className="form-control" name="observations" value={patient.observations} onChange={handleChange}></textarea>
          </fieldset>

          <button type="submit" className="btn btn-primary w-100 mt-3">Add Patient</button>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;
