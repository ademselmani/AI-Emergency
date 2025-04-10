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
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="text-center mb-4 card p-3">Update medical monitoring</h1>
      <form onSubmit={handleSubmit} noValidate className="border p-4 rounded shadow-sm bg-light">
        {/* Category */}
        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <select
            className="form-select"
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
          <div className="mb-3">
            <label htmlFor="customCategory" className="form-label">New Category</label>
            <input
              type="text"
              className="form-control"
              id="customCategory"
              name="customCategory"
              value={treatment.customCategory}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Details */}
        <div className="mb-3">
          <label htmlFor="details" className="form-label">Treatment Details</label>
          <textarea
            className="form-control"
            id="details"
            name="details"
            rows="3"
            value={treatment.details}
            onChange={handleChange}
            required
          />
        </div>

        {/* Start Date */}
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            id="startDate"
            name="startDate"
            value={treatment.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* End Date */}
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">End Date (optional)</label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            name="endDate"
            value={treatment.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Doctors */}
        <div className="mb-3">
          <label className="form-label">Treating Doctors</label>
          <Select
            isMulti
            options={doctors}
            isLoading={loading}
            onChange={handleDoctorsSelect}
            value={doctors.filter((doctor) => treatment.treatedBy.includes(doctor.value))}
            placeholder="Select doctors..."
            isSearchable
            required
          />
        </div>

        {/* Equipment */}
        <div className="mb-3">
          <label className="form-label">Equipment</label>
          <Select
            isMulti
            options={equipmentList}
            isLoading={loading}
            onChange={handleEquipmentSelect}
            value={equipmentList.filter((eq) => treatment.equipment.includes(eq.value))}
            placeholder="Select equipment..."
            isSearchable
          />
        </div>

        {/* Submit Button */}
        <div className="d-grid">
          <button type="submit" className="btn btn-primary">
            Update Treatment
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMedicalTreatment;