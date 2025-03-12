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

        setDoctors(availableDoctors.map(doctor => ({ value: doctor._id, label: `${doctor.name} (${doctor.specialization})` })));
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to fetch doctors. Please try again.');
      }
    };

    const fetchEquipment = async () => {
      try {
        const response = await axios.get('http://localhost:3000/equipments');
        const availableEquipment = response.data.filter(equip => equip.status === "AVAILABLE");

        setEquipmentOptions(
          availableEquipment.map(equip => ({
            value: equip._id,
            label: `${equip.name} (in ${equip.room.name} with  serial number : ${equip.serialNumber}, model : ${equip.model})`,
          }))
        );
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to fetch equipment.');
      }
    };

    fetchDoctors();
    fetchEquipment();
    setLoading(false);
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setTreatment((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
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
      treatedBy: selectedOptions ? selectedOptions.map(option => option.value) : [],
    }));
  };

  const handleEquipmentSelect = (selectedOptions) => {
    setTreatment((prev) => ({
      ...prev,
      equipment: selectedOptions ? selectedOptions.map(option => option.value) : [],
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      toast.success('  Medical Monitoring added successfully!');
      navigate(`/medical-treatments/patient/show/${treatment.patient}`, { state: { patient: selectedPatient } });
    } catch (error) {
      console.error('Error adding Medical Monitoring:', error);
      toast.error(`Error: ${error.response?.data?.message || 'Failed to add Medical Monitoring'}`);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <h1 className="text-center mb-4 card p-3">Add Medical monitoring</h1>
      <form onSubmit={handleSubmit} noValidate className="border p-4 rounded shadow-sm bg-light">
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select className="form-select" name="category" value={treatment.category} onChange={handleCategoryChange} disabled={useCustomCategory}>
            <option value="">Select a category</option>
            {['TRAUMA', 'SURGICAL', 'PSYCHIATRIC', 'RESPIRATORY', 'CARDIAC'].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="CUSTOM">Other...</option>
          </select>
        </div>
        {useCustomCategory && <input type="text" className="form-control mb-3" name="customCategory" value={treatment.customCategory} onChange={handleChange} placeholder="Enter new category" required />}
        
        <div className="mb-3">
          <textarea className="form-control" name="details" rows="3" value={treatment.details} onChange={handleChange} placeholder="Enter treatment details" required />
        </div>
        <input type="date" className="form-control mb-3" name="startDate" value={treatment.startDate} onChange={handleChange} required />
        <input type="date" className="form-control mb-3" name="endDate" value={treatment.endDate} onChange={handleChange} />

        <label className="form-label">Doctor</label>
        <Select options={doctors} isLoading={loading} onChange={handleDoctorSelect} placeholder="Search for a doctor..." isSearchable isMulti required />

        <label className="form-label mt-3">Equipment</label>
        <Select options={equipmentOptions} isLoading={loading} isMulti onChange={handleEquipmentSelect} placeholder="Select equipment..." isSearchable />

        <button type="submit" className="btn btn-primary d-block mt-3">Add Medical Monitoring
        </button>
      </form>
    </div>
  );
};

export default AddMedicalTreatment;