import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Card, Container, Row, Col, Button, Collapse, Spinner, Form, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faUserCircle, faAmbulance, faFileInvoiceDollar, faAddressBook, faClock } from '@fortawesome/free-solid-svg-icons';

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
  const [openSections, setOpenSections] = useState({
    basicInfo: false,
    emergencyInfo: false,
    insuranceInfo: false,
    contactInfo: false,
    timestamps: false
  });
  const [patientDetails, setPatientDetails] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [treatmentsPerPage] = useState(6);

  const InfoItem = ({ label, value }) => (
    <div className="mb-2">
      <strong>{label}:</strong> {value || 'N/A'}
    </div>
  );

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
        setPatientDetails(selectedPatient);
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
      return doctor ? `${doctor.name} ${doctor.familyName}` : 'Unknown';
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
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
        <Card className="mb-4 shadow-sm border-primary">
          <Card.Header className="bg-secondary text-white">
            <h3 className="mb-0">Patient Information</h3>
          </Card.Header>
          <Card.Body>
            {/* Basic Information Section */}
            <div className="info-section mb-4 border-bottom">
              <div 
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('basicInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                  Basic Information
                </h5>
                <FontAwesomeIcon icon={openSections.basicInfo ? faChevronUp : faChevronDown} />
              </div>
              <Collapse in={openSections.basicInfo}>
                <div className="p-3">
                  <Row>
                    <Col md={6}>
                      <InfoItem label="Full Name" value={`${patientDetails.firstName} ${patientDetails.lastName}`} />
                      <InfoItem label="Birth Date" value={new Date(patientDetails.birthDate).toLocaleDateString()} />
                      <InfoItem label="Birth Place" value={patientDetails.birthPlace} />
                    </Col>
                    <Col md={6}>
                      <InfoItem label="Gender" value={patientDetails.sex} />
                      <InfoItem label="Phone" value={patientDetails.phone} />
                    </Col>
                  </Row>
                </div>
              </Collapse>
            </div>

            {/* Emergency Information Section */}
            <div className="info-section mb-4 border-bottom">
              <div 
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('emergencyInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faAmbulance} className="me-2" />
                  Emergency Information
                </h5>
                <FontAwesomeIcon icon={openSections.emergencyInfo ? faChevronUp : faChevronDown} />
              </div>
              <Collapse in={openSections.emergencyInfo}>
                <div className="p-3">
                  <Row>
                    <Col md={6}>
                      <InfoItem label="Arrival Mode" value={patientDetails.arrivalMode} />
                      <InfoItem label="Emergency Reason" value={patientDetails.emergencyReason} />
                    </Col>
                    <Col md={6}>
                      <InfoItem label="Status" value={patientDetails.status} />
                      <InfoItem label="Emergency Area" value={patientDetails.emergencyArea} />
                    </Col>
                  </Row>
                  <InfoItem label="Observations" value={patientDetails.observations} />
                </div>
              </Collapse>
            </div>

            {/* Insurance Information Section */}
            <div className="info-section mb-4 border-bottom">
              <div 
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('insuranceInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                  Insurance Details
                </h5>
                <FontAwesomeIcon icon={openSections.insuranceInfo ? faChevronUp : faChevronDown} />
              </div>
              <Collapse in={openSections.insuranceInfo}>
                <div className="p-3">
                  <Row>
                    <Col md={6}>
                      <InfoItem label="Card Number" value={patientDetails.insurance?.cardNumber || 'N/A'} />
                    </Col>
                    <Col md={6}>
                      <InfoItem label="Provider" value={patientDetails.insurance?.provider || 'N/A'} />
                    </Col>
                  </Row>
                </div>
              </Collapse>
            </div>

            {/* Contact Information Section */}
            <div className="info-section mb-4 border-bottom">
              <div 
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('contactInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faAddressBook} className="me-2" />
                  Contact Person
                </h5>
                <FontAwesomeIcon icon={openSections.contactInfo ? faChevronUp : faChevronDown} />
              </div>
              <Collapse in={openSections.contactInfo}>
                <div className="p-3">
                  <Row>
                    <Col md={6}>
                      <InfoItem label="Name" value={patientDetails.contact?.name} />
                      <InfoItem label="Relation" value={patientDetails.contact?.relation} />
                    </Col>
                    <Col md={6}>
                      <InfoItem label="Phone" value={patientDetails.contact?.phone} />
                      <InfoItem label="Email" value={patientDetails.contact?.email} />
                    </Col>
                  </Row>
                </div>
              </Collapse>
            </div>

            {/* Timestamps Section */}
            <div className="info-section">
              <div 
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('timestamps')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  Timestamps
                </h5>
                <FontAwesomeIcon icon={openSections.timestamps ? faChevronUp : faChevronDown} />
              </div>
              <Collapse in={openSections.timestamps}>
                <div className="p-3">
                  <InfoItem label="Arrival Time" value={new Date(patientDetails.arrivalTime).toLocaleString()} />
                  <InfoItem label="Created At" value={new Date(patientDetails.createdAt).toLocaleString()} />
                  <InfoItem label="Updated At" value={new Date(patientDetails.updatedAt).toLocaleString()} />
                </div>
              </Collapse>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Rest of your component remains the same */}
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
                        label: `${doctor.name} ${doctor.familyName}`,
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