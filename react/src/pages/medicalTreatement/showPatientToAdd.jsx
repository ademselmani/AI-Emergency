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
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="text-center mb-4 card p-3">Add Medical Monitoring</h1>
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light" noValidate>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            className={`form-select ${focusState.category === false && !treatment.category && !useCustomCategory ? 'is-invalid' : ''}`}
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
          <div className="mb-3">
            <input
              type="text"
              name="customCategory"
              className={`form-control ${focusState.customCategory === false && treatment.customCategory.length < 3 ? 'is-invalid' : ''}`}
              value={treatment.customCategory}
              onChange={handleChange}
              onFocus={() => handleFocus('customCategory')}
              onBlur={() => handleBlur('customCategory')}
              placeholder="Enter new category"
              required
            />
          </div>
        )}

        <div className="mb-3">
          <textarea
            className={`form-control ${focusState.details === false && treatment.details.length < 10 ? 'is-invalid' : ''}`}
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

        <label className="form-label">Start Date</label>
        <input
          type="date"
          className={`form-control mb-3 ${focusState.startDate === false && !treatment.startDate ? 'is-invalid' : ''}`}
          name="startDate"
          value={treatment.startDate}
          onChange={handleChange}
          onFocus={() => handleFocus('startDate')}
          onBlur={() => handleBlur('startDate')}
          required
        />

        <label className="form-label">End Date</label>
        <input
          type="date"
          className={`form-control mb-3 ${focusState.endDate === false && treatment.endDate && new Date(treatment.endDate) < new Date(treatment.startDate) ? 'is-invalid' : ''}`}
          name="endDate"
          value={treatment.endDate}
          onChange={handleChange}
          onFocus={() => handleFocus('endDate')}
          onBlur={() => handleBlur('endDate')}
        />

        <label className="form-label">Doctors</label>
        <Select
          options={doctors}
          isLoading={loading}
          onChange={handleDoctorSelect}
          placeholder="Select doctors"
          isMulti
          onFocus={() => handleFocus('treatedBy')}
          onBlur={() => handleBlur('treatedBy')}
          className={focusState.treatedBy === false && treatment.treatedBy.length === 0 ? 'border border-danger rounded' : ''}
        />

        <label className="form-label mt-3">Equipment</label>
        <Select
          options={equipmentOptions}
          isLoading={loading}
          isMulti
          onChange={handleEquipmentSelect}
          placeholder="Select equipment"
          isSearchable
        />

        <button type="submit" className="btn btn-primary d-block mt-3">Add Medical Monitoring</button>
      </form>
    </div>
  );
};

export default AddMedicalTreatment;
