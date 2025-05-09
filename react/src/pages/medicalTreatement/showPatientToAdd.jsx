import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddMedicalTreatment = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPatient = location.state ? location.state.patient : null;

  const [treatment, setTreatment] = useState({
    category: '',
    customCategory: '',
    status: false,
    details: '',
    startDate: '',
    endDate: '',
    treatedBy: [],
    patient: patientId || (selectedPatient ? selectedPatient._id : ''),
    equipment: [],
  });

  const [focusState, setFocusState] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    if (selectedPatient || patientId) {
      setTreatment((prev) => ({
        ...prev,
        patient: selectedPatient ? selectedPatient._id : patientId,
      }));
    }
  }, [selectedPatient, patientId]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3000/employee/employees/doctor');
        const availableDoctors = response.data.filter(doctor => doctor.status === "active");
        setDoctors(availableDoctors.map(doctor => ({
          value: doctor._id,
          label: `${doctor.name} ${doctor.familyName}`,
        })));
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to fetch doctors.');
      }
    };

    const fetchEquipment = async () => {
      try {
        const response = await axios.get('http://localhost:3000/equipments');
        const availableEquipment = response.data.filter(equip => equip.status === "AVAILABLE");
        setEquipmentOptions(availableEquipment.map(equip => ({
          value: equip._id,
          label: `${equip.name} (in ${equip.room.name}, SN: ${equip.serialNumber})`,
        })));
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to fetch equipment.');
      }
    };

    fetchDoctors();
    fetchEquipment();
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTreatment((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFocus = (field) => {
    setFocusState((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocusState((prev) => ({ ...prev, [field]: false }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setUseCustomCategory(value === 'CUSTOM');
    setTreatment((prev) => ({
      ...prev,
      category: value === 'CUSTOM' ? '' : value,
      customCategory: '',
    }));
  };

  const handleDoctorSelect = (selectedOptions) => {
    setTreatment((prev) => ({
      ...prev,
      treatedBy: selectedOptions ? selectedOptions.map(o => o.value) : [],
    }));
  };

  const handleEquipmentSelect = (selectedOptions) => {
    setTreatment((prev) => ({
      ...prev,
      equipment: selectedOptions ? selectedOptions.map(o => o.value) : [],
    }));
  };

  const validateForm = () => {
    if (!treatment.category && !useCustomCategory) return toast.error('Please select a treatment category.');
    if (useCustomCategory && (!treatment.customCategory.trim() || treatment.customCategory.length < 3)) return toast.error('Custom category must be at least 3 characters.');
    if (!treatment.details.trim() || treatment.details.length < 10) return toast.error('Details must be at least 10 characters.');
    if (!treatment.startDate) return toast.error('Please select a start date.');
    if (treatment.endDate && new Date(treatment.endDate) < new Date(treatment.startDate)) return toast.error('End date cannot be before start date.');
    if (treatment.treatedBy.length === 0) return toast.error('Please select at least one doctor.');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const treatmentData = {
      category: useCustomCategory ? treatment.customCategory.trim().toUpperCase() : treatment.category,
      status: treatment.status,
      details: treatment.details,
      startDate: new Date(treatment.startDate),
      endDate: treatment.endDate ? new Date(treatment.endDate) : null,
      treatedBy: treatment.treatedBy,
      patient: treatment.patient,
      equipment: treatment.equipment,
    };

    try {
      await axios.post(`http://localhost:3000/api/treatments/${treatment.patient}`, treatmentData);
      toast.success('Medical Monitoring added successfully!');
      navigate(`/medical-treatments/patient/show/${treatment.patient}`, { state: { patient: selectedPatient } });
    } catch (error) {
      console.error('Error adding treatment:', error);
      toast.error(`Error: ${error.response?.data?.message || 'Failed to add treatment'}`);
    }
  };

  return (
    <div className="add-treatment-container">
      <ToastContainer />
      <h1 className="add-treatment-title">Add Medical Monitoring</h1>
      <form onSubmit={handleSubmit} className="add-treatment-form" noValidate>
        <div className="form-group">
          <label>Category</label>
          <select
            className={focusState.category === false && !treatment.category && !useCustomCategory ? 'invalid' : ''}
            name="category"
            value={treatment.category}
            onChange={handleCategoryChange}
            onFocus={() => handleFocus('category')}
            onBlur={() => handleBlur('category')}
            disabled={useCustomCategory}
          >
            <option value="">Select a category</option>
            {['TRAUMA', 'SURGICAL', 'PSYCHIATRIC', 'RESPIRATORY', 'CARDIAC'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="CUSTOM">Other...</option>
          </select>
        </div>

        {useCustomCategory && (
          <div className="form-group">
            <input
              type="text"
              name="customCategory"
              className={focusState.customCategory === false && treatment.customCategory.length < 3 ? 'invalid' : ''}
              value={treatment.customCategory}
              onChange={handleChange}
              onFocus={() => handleFocus('customCategory')}
              onBlur={() => handleBlur('customCategory')}
              placeholder="Enter new category"
              required
            />
          </div>
        )}

        <div className="form-group">
          <textarea
            className={focusState.details === false && treatment.details.length < 10 ? 'invalid' : ''}
            name="details"
            rows="3"
            value={treatment.details}
            onChange={handleChange}
            onFocus={() => handleFocus('details')}
            onBlur={() => handleBlur('details')}
            placeholder="Enter treatment details"
            required
          />
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            className={focusState.startDate === false && !treatment.startDate ? 'invalid' : ''}
            name="startDate"
            value={treatment.startDate}
            onChange={handleChange}
            onFocus={() => handleFocus('startDate')}
            onBlur={() => handleBlur('startDate')}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            className={focusState.endDate === false && treatment.endDate && new Date(treatment.endDate) < new Date(treatment.startDate) ? 'invalid' : ''}
            name="endDate"
            value={treatment.endDate}
            onChange={handleChange}
            onFocus={() => handleFocus('endDate')}
            onBlur={() => handleBlur('endDate')}
          />
        </div>

        <div className="form-group">
          <label>Doctors</label>
          <Select
            options={doctors}
            isLoading={loading}
            onChange={handleDoctorSelect}
            placeholder="Select doctors"
            isMulti
            onFocus={() => handleFocus('treatedBy')}
            onBlur={() => handleBlur('treatedBy')}
            className={focusState.treatedBy === false && treatment.treatedBy.length === 0 ? 'invalid-select' : ''}
            classNamePrefix="select"
          />
        </div>

        <div className="form-group">
          <label>Equipment</label>
          <Select
            options={equipmentOptions}
            isLoading={loading}
            isMulti
            onChange={handleEquipmentSelect}
            placeholder="Select equipment"
            isSearchable
            classNamePrefix="select"
          />
        </div>

        <button type="submit" className="submit-button">Add Medical Monitoring</button>
      </form>

      <style jsx>{`
        .add-treatment-container {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .add-treatment-title {
          color: #5c2c22;
          text-align: center;
          margin-bottom: 2rem;
          font-weight: 600;
          padding: 1rem;
          background: #fff9f7;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(255, 140, 105, 0.1);
          border: 1px solid #ffe5dd;
        }

        .add-treatment-form {
          background: #fff9f7;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(255, 140, 105, 0.1);
          border: 1px solid #ffe5dd;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #5c2c22;
          font-weight: 500;
        }

        .form-group select,
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #ffb8a6;
          background: #fff0eb;
          color: #5c2c22;
          transition: all 0.2s ease;
        }

        .form-group select:focus,
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #FF8C69;
          box-shadow: 0 0 0 2px rgba(255, 140, 105, 0.2);
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .invalid,
        .invalid-select :global(.select__control) {
          border-color: #ff6b6b !important;
        }

        .submit-button {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          background: #FF8C69;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1.5rem;
        }

        .submit-button:hover {
          background: #e67d5b;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(255, 140, 105, 0.3);
        }

        /* Custom styles for react-select */
        :global(.select__control) {
          border-radius: 8px !important;
          border: 1px solid #ffb8a6 !important;
          min-height: 44px !important;
          box-shadow: none !important;
          background: #fff0eb !important;
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

        :global(.select__multi-value) {
          background-color: #ffe5dd !important;
          border-radius: 6px !important;
        }

        :global(.select__multi-value__label) {
          color: #5c2c22 !important;
        }

        :global(.select__multi-value__remove:hover) {
          background-color: #ffb8a6 !important;
          color: #5c2c22 !important;
        }

        @media (max-width: 768px) {
          .add-treatment-container {
            padding: 1rem;
          }
          
          .add-treatment-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AddMedicalTreatment;