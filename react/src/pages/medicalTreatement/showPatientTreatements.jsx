import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Card, Container, Row, Col, Button, Collapse, Spinner, Form, Badge } from 'react-bootstrap';
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
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});
  const [patientDetails, setPatientDetails] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [treatmentsPerPage] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, equipmentRes, treatmentsRes] = await Promise.all([
          axios.get('http://localhost:3000/employee/employees/doctor'),
          axios.get('http://localhost:3000/equipments'),
          patientId ? axios.get(`http://localhost:3000/api/treatments/patient/${patientId}`) : Promise.resolve({ data: [] })
        ]);

        setDoctors(doctorsRes.data);
        setEquipment(equipmentRes.data);
        setTreatments(treatmentsRes.data);
        setPatientDetails(selectedPatient); // Set patient details from the selected patient
      } catch (error) {
        toast.error('Error loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, selectedPatient]);

  useEffect(() => {
    let results = [...treatments];
    if (searchTerm) {
      results = results.filter(treatment =>
        ['details', 'category', 'status']
          .some(key => treatment[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter) {
      results = results.filter(treatment =>
        statusFilter === 'active' ? treatment.status : !treatment.status
      );
    }
    if (doctorFilter) {
      results = results.filter(treatment => treatment.treatedBy.includes(doctorFilter));
    }
    if (sortCriteria) {
      if (sortCriteria === 'startDate' || sortCriteria === 'endDate') {
        results.sort((a, b) => new Date(a[sortCriteria]) - new Date(b[sortCriteria]));
      } else if (sortCriteria === 'treatedBy') {
        results.sort((a, b) => getDoctorNamesByIds(a.treatedBy).localeCompare(getDoctorNamesByIds(b.treatedBy)));
      } else {
        results.sort((a, b) => a[sortCriteria]?.toString().localeCompare(b[sortCriteria]?.toString()));
      }
    }
    setFilteredTreatments(results);
  }, [searchTerm, statusFilter, doctorFilter, sortCriteria, treatments]);

  const handleDelete = async (treatmentId) => {
    if (!window.confirm('Are you sure you want to delete this treatment?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/treatments/${treatmentId}`);
      toast.success('Treatment deleted successfully!');
      setTreatments(prev => prev.filter(t => t._id !== treatmentId));
    } catch (error) {
      toast.error('Failed to delete treatment.');
    }
  };

  const getDoctorNamesByIds = (doctorIds = []) => {
    return doctorIds.map(id => {
      const doctor = doctors.find(doc => doc._id === id);
      return doctor ? `${doctor.name} (${doctor.specialization})` : 'Unknown';
    }).join(', ');
  };

  const getEquipmentNamesByIds = (equipmentIds = []) => {
    return equipmentIds.map(id => {
      const eq = equipment.find(e => e._id === id);
      return eq ? eq.name : 'Unknown';
    }).join(', ');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDoctorFilter('');
    setSortCriteria('');
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const indexOfLastTreatment = currentPage * treatmentsPerPage;
  const indexOfFirstTreatment = indexOfLastTreatment - treatmentsPerPage;
  const currentTreatments = filteredTreatments.slice(indexOfFirstTreatment, indexOfLastTreatment);

  const activeTreatments = treatments.filter(treatment => treatment.status).length;
  const completedTreatments = treatments.filter(treatment => !treatment.status).length;

  return (
    <Container className="mt-5">
      <ToastContainer />
      {patientDetails && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <motion.h2 whileTap={{ scale: 0.95 }} onClick={() => toggleSection('basicInfo')} className="clickable-title">
              Basic Information <i class='bx bx-chevron-down bx-burst bx-rotate-90' ></i>
            </motion.h2>
            <Collapse in={openSections['basicInfo']}>
              <div>
                <p><strong>Name:</strong> {patientDetails.firstName} {patientDetails.lastName}</p>
                <p><strong>Birth Date:</strong> {new Date(patientDetails.birthDate).toLocaleDateString()}</p>
                <p><strong>Birth Place:</strong> {patientDetails.birthPlace}</p>
                <p><strong>Sex:</strong> {patientDetails.sex}</p>
                <p><strong>Phone:</strong> {patientDetails.phone}</p>
              </div>
            </Collapse>

            <motion.h2 whileTap={{ scale: 0.95 }} onClick={() => toggleSection('emergencyInfo')} className="clickable-title">
              Emergency Information <i class='bx bx-chevron-down bx-burst bx-rotate-90' ></i>
            </motion.h2>
            <Collapse in={openSections['emergencyInfo']}>
              <div>
                <p><strong>Arrival Mode:</strong> {patientDetails.arrivalMode}</p>
                <p><strong>Emergency Reason:</strong> {patientDetails.emergencyReason}</p>
                <p><strong>Observations:</strong> {patientDetails.observations}</p>
                <p><strong>Status:</strong> {patientDetails.status}</p>
                <p><strong>Emergency Area:</strong> {patientDetails.emergencyArea}</p>
              </div>
            </Collapse>

            <motion.h2 whileTap={{ scale: 0.95 }} onClick={() => toggleSection('insuranceInfo')} className="clickable-title">
              Insurance Details <i class='bx bx-chevron-down bx-burst bx-rotate-90' ></i>
            </motion.h2>
            <Collapse in={openSections['insuranceInfo']}>
              <div>
                <p><strong>Card Number:</strong> {patientDetails.insurance?.cardNumber || 'N/A'}</p>
                <p><strong>Provider:</strong> {patientDetails.insurance?.provider || 'N/A'}</p>
              </div>
            </Collapse>

            <motion.h2 whileTap={{ scale: 0.95 }} onClick={() => toggleSection('contactInfo')} className="clickable-title">
              Contact Person <i class='bx bx-chevron-down bx-burst bx-rotate-90' ></i>
            </motion.h2>
            <Collapse in={openSections['contactInfo']}>
              <div>
                <p><strong>Name:</strong> {patientDetails.contact?.name}</p>
                <p><strong>Relation:</strong> {patientDetails.contact?.relation}</p>
                <p><strong>Phone:</strong> {patientDetails.contact?.phone}</p>
                <p><strong>Email:</strong> {patientDetails.contact?.email}</p>
              </div>
            </Collapse>

            <motion.h2 whileTap={{ scale: 0.95 }} onClick={() => toggleSection('timestamps')} className="clickable-title">
              Timestamps <i class='bx bx-chevron-down bx-burst bx-rotate-90' ></i>
            </motion.h2>
            <Collapse in={openSections['timestamps']}>
              <div>
                <p><strong>Arrival Time:</strong> {new Date(patientDetails.arrivalTime).toLocaleString()}</p>
                <p><strong>Created At:</strong> {new Date(patientDetails.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(patientDetails.updatedAt).toLocaleString()}</p>
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      )}
      {loading ? (
        <div className="d-flex justify-content-center mt-4"><Spinner animation="border" variant="primary" /></div>
      ) : (
        <>
          <h2 className="my-4">Medical Monitoring</h2>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Select
                    options={[
                      { value: '', label: 'Sort by...' },
                      { value: 'category', label: 'Category' },
                      { value: 'status', label: 'Status' },
                      { value: 'startDate', label: 'Start Date' },
                      { value: 'endDate', label: 'End Date' },
                      { value: 'treatedBy', label: 'Doctor' },
                    ]}
                    onChange={(option) => setSortCriteria(option?.value || '')}
                    placeholder="Sort by..."
                  />
                </Col>
                <Col md={2}>
                  <Select
                    options={[
                      { value: '', label: 'Filter by status...' },
                      { value: 'active', label: 'Active' },
                      { value: 'completed', label: 'Completed' },
                    ]}
                    onChange={(option) => setStatusFilter(option?.value || '')}
                    placeholder="Filter by status..."
                  />
                </Col>
                <Col md={2}>
                  <Select
                    options={[
                      { value: '', label: 'Filter by doctor...' },
                      ...doctors.map(doctor => ({
                        value: doctor._id,
                        label: `${doctor.name} (${doctor.specialization})`,
                      })),
                    ]}
                    onChange={(option) => setDoctorFilter(option?.value || '')}
                    placeholder="Filter by doctor..."
                  />
                </Col>
                <Col md={2}>
                  <Button variant="outline-secondary" onClick={resetFilters} className="w-100">
                    Reset Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Row>
            <Col>
              <Badge bg="info" className="me-2">Active Treatments: {activeTreatments}</Badge>
              <Badge bg="secondary">Completed Treatments: {completedTreatments}</Badge>
            </Col>
          </Row>
          <Row className="mt-4">
            {currentTreatments.length ? currentTreatments.map((treatment) => (
              <Col key={treatment._id} md={4} className="mb-4">
                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <Card.Title className="text-primary">{treatment.category}</Card.Title>
                      <Card.Text>
                        <strong>Status:</strong> {treatment.status ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Completed</Badge>}
                      </Card.Text>
                      <Card.Text><strong>Details:</strong> {treatment.details}</Card.Text>
                      <Card.Text><strong>Start:</strong> {new Date(treatment.startDate).toLocaleDateString()}</Card.Text>
                      <Card.Text><strong>End:</strong> {treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing'}</Card.Text>
                      <Card.Text><strong>Doctors:</strong> {getDoctorNamesByIds(treatment.treatedBy)}</Card.Text>
                      {treatment.equipment && treatment.equipment.length > 0 && (
                        <Card.Text><strong>Equipment:</strong> {getEquipmentNamesByIds(treatment.equipment)}</Card.Text>
                      )}
                      <div className="d-flex justify-content-between mt-3">
                        <NavLink to={`/medical-treatments/edit/${treatment._id}`} state={{ treatment, patient: selectedPatient }} className="btn btn-secondary btn-sm">
                          Edit
                        </NavLink>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(treatment._id)}>
                          Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            )) : (
              <Col>
                <p className="text-muted text-center">No treatments found.</p>
              </Col>
            )}
          </Row>
          <Row className="mt-4">
            <Col className="d-flex justify-content-center">
              <Button
                variant="outline-primary"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="me-2"
              >
                Previous
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={indexOfLastTreatment >= filteredTreatments.length}
              >
                Next
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default ShowPatientTreatments;