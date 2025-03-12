import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ShowPatientTreatments = () => {
  const location = useLocation();
  const selectedPatient = location.state?.patient || null;
  const patientId = selectedPatient?._id || null;

  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/employee/employees/doctor');
        setDoctors(data);
      } catch (error) {
        toast.error('Error loading doctors.');
      } finally {
        setLoading(false);
      }
    };

    const fetchTreatments = async () => {
      try {
        const { data } = await axios.get(`http://localhost:3000/api/treatments/patient/${patientId}`);
        setTreatments(data);
      } catch (error) {
        toast.error('Error loading treatments.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
    if (patientId) {
      fetchTreatments();
    }
  }, [patientId]);

  useEffect(() => {
    let results = [...treatments];
    if (searchTerm) {
      results = results.filter(treatment =>
        ['details', 'category', 'status']
          .some(key => treatment[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (sortCriteria) {
      results.sort((a, b) => a[sortCriteria]?.toString().localeCompare(b[sortCriteria]?.toString()));
    }
    setFilteredTreatments(results);
  }, [searchTerm, sortCriteria, treatments]);

  const handleDelete = async (treatmentId) => {
    if (!window.confirm('Are you sure you want to delete this treatment?')) return;
    console.log(treatmentId, "id for delete");

    try {
      await axios.delete(`http://localhost:3000/api/treatments/${treatmentId}`);
      toast.success('Treatment deleted successfully!');
      setTreatments(prev => prev.filter(t => t._id !== treatmentId));
    } catch (error) {
      toast.error('Failed to delete treatment.');
    }
  };

  const getDoctorNameById = (doctorId) => {
    const doctor = doctors.find(doc => doc._id === doctorId);
    return doctor ? `${doctor.name} (${doctor.specialization})` : 'Unknown';
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="patient-header bg-light p-4 rounded shadow-sm mb-4">
        <h2 className="display-5">{selectedPatient?.name} {selectedPatient?.familyName}</h2>
        <p className="text-muted"><strong>CIN:</strong> {selectedPatient?.cin}</p>
        <p className="text-muted"><strong>Gender:</strong> {selectedPatient?.gender}</p>
        <p className="text-muted"><strong>Status:</strong> {selectedPatient?.status}</p>
        <p className="text-muted"><strong>Date of Birth:</strong> {new Date(selectedPatient?.dateOfBirth).toLocaleDateString()}</p>
        <NavLink to={`/medical-treatments/patient/add/${selectedPatient?._id}`} state={{ patient: selectedPatient }} className="btn btn-outline-success">
          Add Treatment
        </NavLink>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center mt-4"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <h2 className="my-4">Medical Treatments</h2>
          <input type="text" className="form-control form-control-lg mb-3" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Select options={[{ value: '', label: 'Sort by...' }, { value: 'category', label: 'Category' }, { value: 'status', label: 'Status' }]} onChange={(option) => setSortCriteria(option.value)} placeholder="Sort by..." className="mb-3" />
          <motion.div className="row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {filteredTreatments.length ? filteredTreatments.map((treatment) => (
              <div key={treatment._id} className="col-md-4 mb-4">
                <motion.div className="card shadow-sm h-100" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <div className="card-body">
                    <h5 className="card-title text-primary">{treatment.category}</h5>
                    <p className="card-text"><strong>Status:</strong> {treatment.status ? 'Active' : 'Completed'}</p>
                    <p className="card-text"><strong>Details:</strong> {treatment.details}</p>
                    <p className="card-text"><strong>Start:</strong> {new Date(treatment.startDate).toLocaleDateString()}</p>
                    <p className="card-text"><strong>End:</strong> {treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing'}</p>
                    <p className="card-text"><strong>Doctor:</strong> {getDoctorNameById(treatment.treatedBy)}</p>
                    <div className="d-flex justify-content-between mt-3">
                      <NavLink to={`/medical-treatments/edit/${treatment._id}`} state={{ treatment, patient: selectedPatient }} className="btn btn-secondary btn-sm">Edit</NavLink>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(treatment._id)}>Delete</button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )) : (<p className="text-muted">No treatments found.</p>)}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ShowPatientTreatments;
