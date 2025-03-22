import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddPatientForm.css';

const UpdatePatientForm = () => {
  const { id } = useParams(); // Retrieve patient ID from URL
  const navigate = useNavigate();
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
    status: 'Triage',
    emergencyArea: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Retrieved ID: ", id); // Verify ID
    if (id) {
      axios.get(`http://localhost:3000/api/patients/${id}`)
        .then(response => {
          console.log("Retrieved data: ", response.data); // Display retrieved data
          setPatient(response.data.data); // Update patient state
          setLoading(false);
        })
        .catch(error => {
          setMessage(`Error: ${error.response?.data?.error || error.message}`);
          setLoading(false);
        });
    }
  }, [id]); // Retrieve data each time ID changes

  // Display `patient` state for debugging
  console.log("Patient state: ", patient);

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
      // Update patient in the database
      await axios.put(`http://localhost:3000/api/patients/${id}`, patient);
      setMessage('Patient successfully updated!');
      setTimeout(() => navigate('/showPatients'), 2000); // Redirect after success
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
        <h2 className="text-center mb-4">Edit Patient</h2>
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
                <label>Date of Birth:</label>
                <input type="date" className="form-control" name="birthDate" value={patient.birthDate} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label>Place of Birth:</label>
                <input type="text" className="form-control" name="birthPlace" value={patient.birthPlace} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label>Gender:</label>
                <select className="form-control" name="sex" value={patient.sex} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label>Phone:</label>
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
              <div className="col-md-6">
                <label>Status:</label>
                <select className="form-control" name="status" value={patient.status} onChange={handleChange} required>
                  <option value="Triage">Pending</option>
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

          {/* Section 3: Insurance Information */}
          <fieldset>
            <legend>Insurance Information</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Card Number:</label>
                <input type="text" className="form-control" name="insurance.cardNumber" value={patient.insurance.cardNumber} onChange={(e) => handleNestedChange(e, 'insurance')} />
              </div>
              <div className="col-md-6">
                <label>Provider:</label>
                <input type="text" className="form-control" name="insurance.provider" value={patient.insurance.provider} onChange={(e) => handleNestedChange(e, 'insurance')} />
              </div>
            </div>
          </fieldset>

          {/* Section 4: Emergency Contact */}
          <fieldset>
            <legend>Emergency Contact</legend>
            <div className="row">
              <div className="col-md-6">
                <label>Name:</label>
                <input type="text" className="form-control" name="contact.name" value={patient.contact.name} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>
              <div className="col-md-6">
                <label>Relation:</label>
                <input type="text" className="form-control" name="contact.relation" value={patient.contact.relation} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>
              <div className="col-md-6">
                <label>Phone:</label>
                <input type="text" className="form-control" name="contact.phone" value={patient.contact.phone} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>
              <div className="col-md-6">
                <label>Email:</label>
                <input type="email" className="form-control" name="contact.email" value={patient.contact.email} onChange={(e) => handleNestedChange(e, 'contact')} />
              </div>
            </div>
          </fieldset>

          {/* Section 5: Observations */}
          <fieldset>
            <legend>Observations</legend>
            <div className="row">
              <div className="col-md-12">
                <label>Observations:</label>
                <textarea className="form-control" name="observations" value={patient.observations} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary w-100 mt-3">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePatientForm;
