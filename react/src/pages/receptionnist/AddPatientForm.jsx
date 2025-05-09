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
    status: 'Triage',
    emergencyArea: ''
  });

  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

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
      await axios.post('http://localhost:3000/api/patients', patient);
      setMessage('Patient added successfully!');
      setPatient({
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
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="modern-form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>New Patient Registration</h2>
          <p className="form-subtitle">Please fill in all required fields</p>
        </div>
        
        {message && (
          <div className={`message-alert ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="form-navigation">
          <button 
            className={`nav-btn ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            <i className="fas fa-user"></i> Personal
          </button>
          <button 
            className={`nav-btn ${activeSection === 'arrival' ? 'active' : ''}`}
            onClick={() => setActiveSection('arrival')}
          >
            <i className="fas fa-ambulance"></i> Arrival
          </button>
          {patient.arrivalMode === 'Ambulance' && (
            <button 
              className={`nav-btn ${activeSection === 'insurance' ? 'active' : ''}`}
              onClick={() => setActiveSection('insurance')}
            >
              <i className="fas fa-credit-card"></i> Insurance
            </button>
          )}
          <button 
            className={`nav-btn ${activeSection === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveSection('contact')}
          >
            <i className="fas fa-address-book"></i> Contact
          </button>
          <button 
            className={`nav-btn ${activeSection === 'observations' ? 'active' : ''}`}
            onClick={() => setActiveSection('observations')}
          >
            <i className="fas fa-notes-medical"></i> Notes
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className={`form-section ${activeSection === 'personal' ? 'active' : ''}`}>
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>First Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={patient.firstName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter first name"
                />
              </div>

              <div className="input-group">
                <label>Last Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={patient.lastName} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter last name"
                />
              </div>

              <div className="input-group">
                <label>Date of Birth <span className="required">*</span></label>
                <input 
                  type="date" 
                  name="birthDate" 
                  value={patient.birthDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Place of Birth</label>
                <input 
                  type="text" 
                  name="birthPlace" 
                  value={patient.birthPlace} 
                  onChange={handleChange} 
                  placeholder="City, Country"
                />
              </div>

              <div className="input-group">
                <label>Gender <span className="required">*</span></label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="sex" 
                      value="Male" 
                      checked={patient.sex === 'Male'} 
                      onChange={handleChange} 
                      required 
                    />
                    <span className="radio-label">Male</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="sex" 
                      value="Female" 
                      checked={patient.sex === 'Female'} 
                      onChange={handleChange} 
                    />
                    <span className="radio-label">Female</span>
                  </label>
                  <label className="radio-option">
                    <input 
                      type="radio" 
                      name="sex" 
                      value="Other" 
                      checked={patient.sex === 'Other'} 
                      onChange={handleChange} 
                    />
                    <span className="radio-label">Other</span>
                  </label>
                </div>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={patient.phone} 
                  onChange={handleChange} 
                  placeholder="+1 (___) ___-____"
                />
              </div>
            </div>
          </div>

          {/* Arrival & Emergency Section */}
          <div className={`form-section ${activeSection === 'arrival' ? 'active' : ''}`}>
            <h3 className="section-title">Arrival & Emergency Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Arrival Mode <span className="required">*</span></label>
                <select 
                  className="modern-select" 
                  name="arrivalMode" 
                  value={patient.arrivalMode} 
                  onChange={handleChange} 
                  required
                >
                  <option value="Ambulance">Ambulance</option>
                  <option value="On foot">On foot</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Emergency Reason <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="emergencyReason" 
                  value={patient.emergencyReason} 
                  onChange={handleChange} 
                  required 
                  placeholder="Brief description"
                />
              </div>

              <div className="input-group">
                <label>Status <span className="required">*</span></label>
                <select 
                  className="modern-select" 
                  name="status" 
                  value={patient.status} 
                  onChange={handleChange} 
                  required
                >
                  <option value="Triage">Triage</option>
                  <option value="Critical">Critical</option>
                  <option value="Stable">Stable</option>
                  <option value="Serious">Serious</option>
                </select>
              </div>

              <div className="input-group">
                <label>Emergency Area <span className="required">*</span></label>
                <select 
                  className="modern-select" 
                  name="emergencyArea" 
                  value={patient.emergencyArea} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select area</option>
                  <option value="Trauma">Trauma</option>
                  <option value="Cardiac">Cardiac</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Respiratory">Respiratory</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>
            </div>
          </div>

          {/* Insurance Section (conditional) */}
          {patient.arrivalMode === 'Ambulance' && (
            <div className={`form-section ${activeSection === 'insurance' ? 'active' : ''}`}>
              <h3 className="section-title">Insurance Information</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Insurance Card Number</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    value={patient.insurance.cardNumber} 
                    onChange={(e) => handleNestedChange(e, 'insurance')} 
                    placeholder="Enter card number"
                  />
                </div>

                <div className="input-group">
                  <label>Insurance Provider</label>
                  <input 
                    type="text" 
                    name="provider" 
                    value={patient.insurance.provider} 
                    onChange={(e) => handleNestedChange(e, 'insurance')} 
                    placeholder="Provider name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Section */}
          <div className={`form-section ${activeSection === 'contact' ? 'active' : ''}`}>
            <h3 className="section-title">Emergency Contact</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Contact Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={patient.contact.name} 
                  onChange={(e) => handleNestedChange(e, 'contact')} 
                  placeholder="Full name"
                />
              </div>

              <div className="input-group">
                <label>Relationship</label>
                <select 
                  className="modern-select" 
                  name="relation" 
                  value={patient.contact.relation} 
                  onChange={(e) => handleNestedChange(e, 'contact')}
                >
                  <option value="">Select relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Contact Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={patient.contact.phone} 
                  onChange={(e) => handleNestedChange(e, 'contact')} 
                  placeholder="+1 (___) ___-____"
                />
              </div>

              <div className="input-group">
                <label>Contact Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={patient.contact.email} 
                  onChange={(e) => handleNestedChange(e, 'contact')} 
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Observations Section */}
          <div className={`form-section ${activeSection === 'observations' ? 'active' : ''}`}>
            <h3 className="section-title">Medical Observations</h3>
            <div className="input-group">
              <label>Initial Observations</label>
              <textarea 
                name="observations" 
                value={patient.observations} 
                onChange={handleChange}
                placeholder="Enter any relevant medical observations..."
                rows="5"
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              <i className="fas fa-save"></i> Save Patient Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientForm;