import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditMedicalTreatment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPatient = location.state?.patient || null;
  const patientId = selectedPatient?._id || null;

  const predefinedCategories = ['TRAUMA', 'SURGICAL', 'PSYCHIATRIC', 'RESPIRATORY', 'CARDIAC'];

  const [treatment, setTreatment] = useState({
    category: '',
    customCategory: '',
    details: '',
    startDate: '',
    endDate: '',
    treatedBy: [],
    equipment: [],
    patient: patientId,
  });

  const [doctors, setDoctors] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [treatmentRes, doctorsRes, equipmentRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/treatments/${id}`),
          axios.get('http://localhost:3000/employee/employees/doctor'),
          axios.get('http://localhost:3000/equipments'),
        ]);

        const treatmentData = treatmentRes.data;

        // Format doctors for react-select
        const formattedDoctors = doctorsRes.data.map((doctor) => ({
          value: doctor._id,
          label: `${doctor.name} ${doctor.familyName}`,
        }));
        setDoctors(formattedDoctors);

        // Format equipment for react-select
        const formattedEquipment = equipmentRes.data.map((eq) => ({
          value: eq._id,
          label: eq.name,
        }));
        setEquipmentList(formattedEquipment);

        // Set treatment state
        setTreatment({
          category: predefinedCategories.includes(treatmentData.category)
            ? treatmentData.category
            : '',
          customCategory: predefinedCategories.includes(treatmentData.category)
            ? ''
            : treatmentData.category,
          details: treatmentData.details,
          startDate: treatmentData.startDate
            ? new Date(treatmentData.startDate).toISOString().substr(0, 10)
            : '',
          endDate: treatmentData.endDate
            ? new Date(treatmentData.endDate).toISOString().substr(0, 10)
            : '',
          treatedBy: treatmentData.treatedBy.map((doctor) => doctor._id),
          equipment: treatmentData.equipment?.map((eq) => eq._id) || [],
          patient: treatmentData.patient,
        });

        if (!predefinedCategories.includes(treatmentData.category)) {
          setUseCustomCategory(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTreatment((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value === 'CUSTOM') {
      setUseCustomCategory(true);
      setTreatment((prev) => ({ ...prev, category: '', customCategory: '' }));
    } else {
      setUseCustomCategory(false);
      setTreatment((prev) => ({ ...prev, category: value, customCategory: '' }));
    }
  };

  const handleDoctorsSelect = (selectedOptions) => {
    setTreatment((prev) => ({
      ...prev,
      treatedBy: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    }));
  };

  const handleEquipmentSelect = (selectedOptions) => {
    setTreatment((prev) => ({
      ...prev,
      equipment: selectedOptions ? selectedOptions.map((option) => option.value) : [],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const categoryToSend = useCustomCategory
      ? treatment.customCategory.trim().toUpperCase()
      : treatment.category;

    const treatmentData = {
      category: categoryToSend,
      details: treatment.details,
      startDate: new Date(treatment.startDate),
      endDate: treatment.endDate ? new Date(treatment.endDate) : null,
      treatedBy: treatment.treatedBy,
      equipment: treatment.equipment,
      patient: treatment.patient,
    };

    try {
      await axios.put(`http://localhost:3000/api/treatments/${id}`, treatmentData);
      toast.success('Treatment updated successfully!');

      if (patientId) {
        navigate(`/medical-treatments/patient/show/${patientId}`, {
          state: { patient: selectedPatient },
        });
      } else {
        console.error('Patient ID is missing');
        toast.error('Error: Missing patient ID');
      }
    } catch (error) {
      console.error('Error updating treatment:', error);
      toast.error(error.response?.data?.error || 'Error updating treatment');
    }
  };

  const validateForm = () => {
    if (!treatment.category && !useCustomCategory) {
      toast.error('Please select a category');
      return false;
    }
    if (useCustomCategory && (!treatment.customCategory.trim() || treatment.customCategory.length < 3)) {
      toast.error('Custom category must be at least 3 characters');
      return false;
    }
    if (!treatment.details.trim() || treatment.details.length < 10) {
      toast.error('Details must be at least 10 characters');
      return false;
    }
    if (!treatment.startDate) {
      toast.error('Please select a start date');
      return false;
    }
    if (treatment.endDate && new Date(treatment.endDate) < new Date(treatment.startDate)) {
      toast.error('End date cannot be before start date');
      return false;
    }
    if (!treatment.treatedBy.length) {
      toast.error('Please select at least one doctor');
      return false;
    }
    return true;
  };

  return (
    <div className="edit-treatment-container">
      <ToastContainer />
      <h1 className="edit-treatment-title">Update medical monitoring</h1>
      <form onSubmit={handleSubmit} noValidate className="edit-treatment-form">
        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={treatment.category}
            onChange={handleCategoryChange}
            required={!useCustomCategory}
            disabled={useCustomCategory}
          >
            <option value="">Select a category</option>
            {predefinedCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="CUSTOM">Other...</option>
          </select>
        </div>

        {/* Custom Category */}
        {useCustomCategory && (
          <div className="form-group">
            <label htmlFor="customCategory">New Category</label>
            <input
              type="text"
              id="customCategory"
              name="customCategory"
              value={treatment.customCategory}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Details */}
        <div className="form-group">
          <label htmlFor="details">Treatment Details</label>
          <textarea
            id="details"
            name="details"
            rows="3"
            value={treatment.details}
            onChange={handleChange}
            required
          />
        </div>

        {/* Start Date */}
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={treatment.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* End Date */}
        <div className="form-group">
          <label htmlFor="endDate">End Date (optional)</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={treatment.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Doctors */}
        <div className="form-group">
          <label>Treating Doctors</label>
          <Select
            isMulti
            options={doctors}
            isLoading={loading}
            onChange={handleDoctorsSelect}
            value={doctors.filter((doctor) => treatment.treatedBy.includes(doctor.value))}
            placeholder="Select doctors..."
            isSearchable
            required
            className="select-input"
            classNamePrefix="select"
          />
        </div>

        {/* Equipment */}
        <div className="form-group">
          <label>Equipment</label>
          <Select
            isMulti
            options={equipmentList}
            isLoading={loading}
            onChange={handleEquipmentSelect}
            value={equipmentList.filter((eq) => treatment.equipment.includes(eq.value))}
            placeholder="Select equipment..."
            isSearchable
            className="select-input"
            classNamePrefix="select"
          />
        </div>

        {/* Submit Button */}
        <div className="form-submit">
          <button type="submit">
            Update Treatment
          </button>
        </div>
      </form>

      <style jsx>{`
        .edit-treatment-container {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .edit-treatment-title {
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

        .edit-treatment-form {
          background:rgb(255, 255, 255);
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
          background:rgb(255, 255, 255);
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

        .form-submit {
          margin-top: 2rem;
        }

        .form-submit button {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          background: #FF8C69;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .form-submit button:hover {
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
          .edit-treatment-container {
            padding: 1rem;
          }
          
          .edit-treatment-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EditMedicalTreatment;