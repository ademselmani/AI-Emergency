import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Card, Container, Row, Col, Button, Collapse, Spinner, Form, Badge } from 'react-bootstrap';
import { color, motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faUserCircle, faFileInvoiceDollar, faAddressBook, faClock, faFileCsv, faFilePdf, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Barcode from 'react-barcode';
import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { User, PlusCircle, Stethoscope } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend);

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
  const [emailLoading, setEmailLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    basicInfo: true,
    emergencyInfo: true,
    insuranceInfo: true,
    contactInfo: true,
    timestamps: true
  });
  const [patientDetails, setPatientDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [treatmentsPerPage] = useState(6);

  // Calculate treatment statistics
  const activeTreatments = treatments.filter(treatment => treatment.status).length;
  const completedTreatments = treatments.filter(treatment => !treatment.status).length;

  // Calculate pagination values
  const indexOfLastTreatment = currentPage * treatmentsPerPage;
  const indexOfFirstTreatment = indexOfLastTreatment - treatmentsPerPage;
  const currentTreatments = filteredTreatments.slice(indexOfFirstTreatment, indexOfLastTreatment);


   const [monthlyData, setMonthlyData] = useState(null);
  const [successRateData, setSuccessRateData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
 
  useEffect(() => {
    // Set loading state to true
    setLoading(true);

    // Fetch Monthly Stats
    axios.get(`http://localhost:3000/api/treatments/monthly-stats/${patientId}`)
      .then(response => {
        const stats = response.data;
        const months = stats.map(item => `${item._id.month}-${item._id.year}`);
        const active = stats.map(item => item.active);
        const completed = stats.map(item => item.completed);

        setMonthlyData({
          labels: months,
          datasets: [
            {
              label: 'Active Treatments',
              data: active,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              fill: true,
            },
            {
              label: 'Completed Treatments',
              data: completed,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              fill: true,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching monthly stats:', error));

    // Fetch Success Rate by Doctor
    axios.get(`http://localhost:3000/api/treatments/success-rate-by-doctor/${patientId}`)
      .then(response => {
        const stats = response.data;
        const doctorNames = stats.map(item => `${item.name} ${item.familyName}` || 'Unknown Doctor');
        const successRates = stats.map(item => item.successRate);

        setSuccessRateData({
          labels: doctorNames,
          datasets: [
            {
              label: 'Success Rate',
              data: successRates,
              backgroundColor: 'blue',
              borderColor: 'blue',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching success rate by doctor:', error));

    // Fetch Category Stats
    axios.get(`http://localhost:3000/api/treatments/category-stats/${patientId}`)
      .then(response => {
        const stats = response.data;
        const categories = stats.map(item => item._id);
        const counts = stats.map(item => item.count);

        // Ignore negative durations for display
        const avgDurations = stats.map(item => item.avgDuration > 0 ? item.avgDuration.toFixed(2) : 'N/A');

        setCategoryData({
          labels: categories,
          datasets: [
            {
              label: 'Treatments by Category',
              data: counts,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
              borderColor: '#fff',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching category stats:', error))
      .finally(() => setLoading(false)); // Set loading to false after all data is fetched
  }, [patientId]);
  
  const InfoItem = ({ label, value }) => (
    <div className="mb-2">
      <strong>{label}:</strong> {value || 'N/A'}
    </div>
  );

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDoctorFilter('');
    setSortCriteria('');
    setCurrentPage(1);
  };
  const [language, setLanguage] = useState('en'); // 🆕 Add language state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, equipmentRes, treatmentsRes] = await Promise.all([
          axios.get('http://localhost:3000/employee/employees/doctor'),
          axios.get('http://localhost:3000/equipments'),
          patientId
            ? axios.get(`http://localhost:3000/api/treatments/patient/${patientId}`, {
                params: { language }, // 🆕 Pass language param
              })
            : Promise.resolve({ data: [] })
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
  }, [patientId, selectedPatient, language]); // 🆕 Add language as a dependency

  useEffect(() => {
    let results = [...treatments];
    
    // Apply filters
    if (searchTerm) {
      results = results.filter(treatment =>
        ['details', 'category', 'status']
          .some(key => treatment[key]?.toString().toLowerCase().includes(searchTerm.toLowerCase()))
   ) }
    
    if (statusFilter) {
      results = results.filter(treatment =>
        statusFilter === 'active' ? treatment.status : !treatment.status
      );
    }
    
    if (doctorFilter) {
      results = results.filter(treatment => treatment.treatedBy.includes(doctorFilter));
    }
    
    // Apply sorting
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
  }, 
  [searchTerm, statusFilter, doctorFilter, sortCriteria, treatments]);

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

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportToCSV = () => {
    if (!filteredTreatments.length) {
      toast.warning('No data to export');
      return;
    }

    const headers = ['Category', 'Status', 'Details', 'Start Date', 'End Date', 'Doctors', 'Equipment'];
    const csvData = filteredTreatments.map(treatment => [
      treatment.category,
      treatment.status ? 'Active' : 'Completed',
      treatment.details,
      new Date(treatment.startDate).toLocaleDateString(),
      treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing',
      getDoctorNamesByIds(treatment.treatedBy),
      treatment.equipment ? getEquipmentNamesByIds(treatment.equipment) : 'None'
    ]);

    let csvContent = headers.join(',') + '\n';
    csvData.forEach(row => {
      csvContent += row.map(item => `"${item}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `patient_treatments_${patientDetails?.firstName || 'unknown'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!filteredTreatments.length || !patientDetails) {
      toast.warning('No data to export');
      return;
    }

    try {
     
      
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      let yPosition = 80; // Track vertical position

      doc.setFontSize(18);
      doc.text('Patient Treatments Report', 15, 15);
      doc.setFontSize(12);
      doc.text(`Patient: ${patientDetails.firstName} ${patientDetails.lastName}`, 15, 25);
      doc.text(`Generated on: ${date}`, 15, 30);
            
      const qrCodeDataUrl = await QRCode.toDataURL(patientDetails._id, { width: 80 });
      doc.addImage(qrCodeDataUrl, 'PNG', 15, 45, 20, 20);
      
       const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, patientDetails._id, {
        format: 'CODE128',
        displayValue: false,
      });
      const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');

      

      doc.addImage(barcodeDataUrl, 'PNG', 120, 45, 60, 15);
      
       // Patient Information Section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('PATIENT INFORMATION', 100, yPosition);
    yPosition += 7;
    doc.setDrawColor(41, 128, 185);
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
     


    doc.setFont(undefined, 'bold');
    doc.text('Basic Information:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Name: ${patientDetails.firstName} ${patientDetails.lastName}`, 20, yPosition);
    doc.text(`Gender: ${patientDetails.sex}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Birth Date: ${new Date(patientDetails.birthDate).toLocaleDateString()}`, 20, yPosition);
    doc.text(`Birth Place: ${patientDetails.birthPlace || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Phone: ${patientDetails.phone || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Emergency Info
    doc.setFont(undefined, 'bold');
    doc.text('Emergency Information:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Arrival Mode: ${patientDetails.arrivalMode || 'N/A'}`, 20, yPosition);
    doc.text(`Status: ${patientDetails.status || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Emergency Reason: ${patientDetails.emergencyReason || 'N/A'}`, 20, yPosition);
    doc.text(`Emergency Area: ${patientDetails.emergencyArea || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Observations: ${patientDetails.observations || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Insurance Info
    doc.setFont(undefined, 'bold');
    doc.text('Insurance Information:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Provider: ${patientDetails.insurance?.provider || 'N/A'}`, 20, yPosition);
    doc.text(`Card Number: ${patientDetails.insurance?.cardNumber || 'N/A'}`, 110, yPosition);
    yPosition += 10;

    // Contact Person
    doc.setFont(undefined, 'bold');
    doc.text('Emergency Contact:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Name: ${patientDetails.contact?.name || 'N/A'}`, 20, yPosition);
    doc.text(`Relation: ${patientDetails.contact?.relation || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Phone: ${patientDetails.contact?.phone || 'N/A'}`, 20, yPosition);
    doc.text(`Email: ${patientDetails.contact?.email || 'N/A'}`, 110, yPosition);
    yPosition += 15;

    // Treatments Section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('TREATMENT HISTORY', 15, yPosition);
    yPosition += 7;
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 10;

    const tableData = filteredTreatments.map(treatment => ({
      category: treatment.category,
      status: treatment.status ? 'Active' : 'Completed',
      startDate: new Date(treatment.startDate).toLocaleDateString(),
      endDate: treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing',
      doctors: getDoctorNamesByIds(treatment.treatedBy),
      equipment: treatment.equipment ? getEquipmentNamesByIds(treatment.equipment) : 'None'
    }));
    
    let y = yPosition; // position de départ dans le PDF
    const lineHeight = 8;
    
    // Titre
    doc.setFontSize(12);
    doc.text('Medical Treatments', 15, y);
    y += 10;
    
    // En-têtes
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(41, 128, 185);
    doc.rect(15, y - 6, 180, 8, 'F');
    doc.text('Category', 17, y);
    doc.text('Status', 47, y);
    doc.text('Start Date', 72, y);
    doc.text('End Date', 102, y);
    doc.text('Doctors', 132, y);
    doc.text('Equipment', 162, y);
    doc.setTextColor(0, 0, 0);
    y += 5;
    
    // Données
    tableData.forEach((treatment, index) => {
      // Alternance couleur de fond
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 4, 180, lineHeight, 'F');
      }
    
      doc.text(treatment.category, 17, y);
      doc.text(treatment.status, 47, y);
      doc.text(treatment.startDate, 72, y);
      doc.text(treatment.endDate, 102, y);
      doc.text(treatment.doctors, 132, y, { maxWidth: 25 });
      doc.text(treatment.equipment, 162, y, { maxWidth: 30 });
    
      y += lineHeight;
    });
    



    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    }

      
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      doc.save(`patient_treatments_${patientDetails.firstName}_${patientDetails.lastName}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF: ' + error.message);
    }
  };

  const sendEmail = async () => {
    if (!filteredTreatments.length || !patientDetails) {
      toast.warning('No data to send');
      return;
    }
  
    try {
      setEmailLoading(true);
      
      // Generate PDF
       
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      let yPosition = 80; // Track vertical position

      doc.setFontSize(18);
      doc.text('Patient Treatments Report', 15, 15);
      doc.setFontSize(12);
      doc.text(`Patient: ${patientDetails.firstName} ${patientDetails.lastName}`, 15, 25);
      doc.text(`Generated on: ${date}`, 15, 30);
            
      const qrCodeDataUrl = await QRCode.toDataURL(patientDetails._id, { width: 80 });
      doc.addImage(qrCodeDataUrl, 'PNG', 15, 45, 20, 20);
      
       const barcodeCanvas = document.createElement('canvas');
      JsBarcode(barcodeCanvas, patientDetails._id, {
        format: 'CODE128',
        displayValue: false,
      });
      const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');
      doc.addImage(barcodeDataUrl, 'PNG', 120, 45, 60, 15);
      
       // Patient Information Section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('PATIENT INFORMATION', 100, yPosition);
    yPosition += 7;
    doc.setDrawColor(41, 128, 185);
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
     


    doc.setFont(undefined, 'bold');
    doc.text('Basic Information:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Name: ${patientDetails.firstName} ${patientDetails.lastName}`, 20, yPosition);
    doc.text(`Gender: ${patientDetails.sex}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Birth Date: ${new Date(patientDetails.birthDate).toLocaleDateString()}`, 20, yPosition);
    doc.text(`Birth Place: ${patientDetails.birthPlace || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Phone: ${patientDetails.phone || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Emergency Info
    doc.setFont(undefined, 'bold');
    doc.text('Emergency Information:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Arrival Mode: ${patientDetails.arrivalMode || 'N/A'}`, 20, yPosition);
    doc.text(`Status: ${patientDetails.status || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Emergency Reason: ${patientDetails.emergencyReason || 'N/A'}`, 20, yPosition);
    doc.text(`Emergency Area: ${patientDetails.emergencyArea || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Observations: ${patientDetails.observations || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Insurance Info
    doc.setFont(undefined, 'bold');
    doc.text('Insurance Information:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Provider: ${patientDetails.insurance?.provider || 'N/A'}`, 20, yPosition);
    doc.text(`Card Number: ${patientDetails.insurance?.cardNumber || 'N/A'}`, 110, yPosition);
    yPosition += 10;

    // Contact Person
    doc.setFont(undefined, 'bold');
    doc.text('Emergency Contact:', 15, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 7;
    
    doc.text(`Name: ${patientDetails.contact?.name || 'N/A'}`, 20, yPosition);
    doc.text(`Relation: ${patientDetails.contact?.relation || 'N/A'}`, 110, yPosition);
    yPosition += 7;
    
    doc.text(`Phone: ${patientDetails.contact?.phone || 'N/A'}`, 20, yPosition);
    doc.text(`Email: ${patientDetails.contact?.email || 'N/A'}`, 110, yPosition);
    yPosition += 15;

    // Treatments Section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('TREATMENT HISTORY', 15, yPosition);
    yPosition += 7;
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 10;

    const tableData = filteredTreatments.map(treatment => ({
      category: treatment.category,
      status: treatment.status ? 'Active' : 'Completed',
      startDate: new Date(treatment.startDate).toLocaleDateString(),
      endDate: treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'Ongoing',
      doctors: getDoctorNamesByIds(treatment.treatedBy),
      equipment: treatment.equipment ? getEquipmentNamesByIds(treatment.equipment) : 'None'
    }));
    
    let y = yPosition; // position de départ dans le PDF
    const lineHeight = 8;
    
    // Titre
    doc.setFontSize(12);
    doc.text('Medical Treatments', 15, y);
    y += 10;
    
    // En-têtes
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(41, 128, 185);
    doc.rect(15, y - 6, 180, 8, 'F');
    doc.text('Category', 17, y);
    doc.text('Status', 47, y);
    doc.text('Start Date', 72, y);
    doc.text('End Date', 102, y);
    doc.text('Doctors', 132, y);
    doc.text('Equipment', 162, y);
    doc.setTextColor(0, 0, 0);
    y += 5;
    
    // Données
    tableData.forEach((treatment, index) => {
      // Alternance couleur de fond
      if (index % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(15, y - 4, 180, lineHeight, 'F');
      }
    
      doc.text(treatment.category, 17, y);
      doc.text(treatment.status, 47, y);
      doc.text(treatment.startDate, 72, y);
      doc.text(treatment.endDate, 102, y);
      doc.text(treatment.doctors, 132, y, { maxWidth: 25 });
      doc.text(treatment.equipment, 162, y, { maxWidth: 30 });
    
      y += lineHeight;
    });
    



    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
    }

      
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const response = await axios.post('http://localhost:3000/api/send-email', {
        to: 'chourabiaziz007@gmail.com',
        subject: `Patient Treatments Report - ${patientDetails.firstName} ${patientDetails.lastName}`,
        text: `Please find attached the treatments report for ${patientDetails.firstName} ${patientDetails.lastName}`,
        pdfData: pdfBase64,
        fileName: `patient_treatments_${patientDetails.firstName}_${patientDetails.lastName}.pdf`
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.message) {
        toast.success(response.data.message);
      } else {
        toast.success('Email sent successfully!');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error(error.response?.data?.error || 'Failed to send email');
    } finally {
      setEmailLoading(false);
    }

   

  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="treatments-page"
    >
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="salmon-toast"
        progressClassName="salmon-progress"
      />
      
      <Container className="mt-4">
        {/* Action Buttons Row */}
        <Row className="mb-4">
          <Col md={12} className="d-flex justify-content-end gap-2">
            <Button 
              variant="salmon-light" 
              onClick={exportToCSV} 
              className="action-btn"
            >
              <FontAwesomeIcon icon={faFileCsv} className="me-2" />
              Export to CSV
            </Button>
            <Button 
              variant="salmon" 
              onClick={exportToPDF} 
              className="action-btn"
            >
              <FontAwesomeIcon icon={faFilePdf} className="me-2" />
              Export to PDF
            </Button>
            <Button 
              variant="salmon-dark" 
              onClick={sendEmail} 
              disabled={emailLoading}
              className="action-btn"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
              {emailLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="salmon" />
          </div>
        ) : (
          <>
            {/* Header and Filters */}
            <Card className="mb-4 salmon-card">
              <Card.Body>
                <h2 className="page-title mb-4">Medical Monitoring</h2>
                
                {/* Language Selector */}
                <Form.Select
                  onChange={(e) => setLanguage(e.target.value)}
                  value={language}
                  className="mb-4 salmon-select"
                >
                  <option value="ar">Arabic - العربية</option>
                  <option value="en">English</option>
                  <option value="fr">French - Français</option>
                  {/* ... other language options ... */}
                </Form.Select>

                <Row className="g-3">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Search treatments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="salmon-input"
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
                      className="salmon-react-select"
                      classNamePrefix="select"
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
                      className="salmon-react-select"
                      classNamePrefix="select"
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
                      className="salmon-react-select"
                      classNamePrefix="select"
                    />
                  </Col>
                  <Col md={2}>
                    <Button 
                      variant="salmon-outline" 
                      onClick={resetFilters} 
                      className="w-100"
                    >
                      Reset Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Stats Badges */}
            <div className="d-flex gap-3 mb-4">
              <p pill bg="salmon" className="bg-danger br text-white p-3">
                Active Treatments: {activeTreatments}
              </p>
              <p pill  className="bg-success text-white br  p-3 ">
                Completed Treatments: {completedTreatments}
              </p>
            </div>

            {/* Add Treatment Button */}
            {selectedPatient && (
              <NavLink
                to={`/medical-treatments/patient/add/${selectedPatient._id}`}
                state={{ patient: selectedPatient }}
                className="btn btn-salmon mb-4 d-inline-flex align-items-center gap-2"
              >
                <PlusCircle size={18} /> Add New Treatment
              </NavLink>
            )}

            {/* Treatments Grid */}
            <Row className="g-4">
              {currentTreatments.length ? (
                currentTreatments.map((treatment) => (
                  <Col key={treatment._id} md={4}>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Card className="h-100 treatment-card">
                        <Card.Body>
                          <Card.Title className="treatment-title">
                            {treatment.category}
                          </Card.Title>
                          
                          <div className=" salmon-light ">
                            <p pill bg={treatment.status ? "salmon" : "salmon-light"}>
                              {treatment.status ? 'Active' : 'Completed'}
                            </p>
                          </div>
                          
                          <div className="treatment-details">
                            <p>Description : </p>
                            <p>{treatment.details}</p>
                            
                            <div className="treatment-dates">
                              <div>
                                <small className="text-muted">Start:</small>
                                <div>{new Date(treatment.startDate).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <small className="text-muted">End:</small>
                                <div>
                                  {treatment.endDate 
                                    ? new Date(treatment.endDate).toLocaleDateString()
                                    : 'Ongoing'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="treatment-staff">
                              <small className="text-muted">Doctors:</small>
                              <div>{getDoctorNamesByIds(treatment.treatedBy)}</div>
                            </div>
                            
                            {treatment.equipment?.length > 0 && (
                              <div className="treatment-equipment">
                                <small className="text-muted">Equipment:</small>
                                <div>{getEquipmentNamesByIds(treatment.equipment)}</div>
                              </div>
                            )}
                          </div>
                          
                          <div className="d-flex justify-content-between mt-3">
                            <NavLink
                              to={`/medical-treatments/edit/${treatment._id}`}
                              state={{ treatment, patient: selectedPatient }}
                              className="btn btn-salmon-outline btn-sm"
                            >
                              Edit
                            </NavLink>
                            <Button
                              variant="salmon-danger"
                              size="sm"
                              onClick={() => handleDelete(treatment._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))
              ) : (
                <Col>
                  <div className="empty-state text-center p-5">
                    <h4 className="text-muted">No treatments found matching your criteria</h4>
                  </div>
                </Col>
              )}
            </Row>

            {/* Pagination */}
            {filteredTreatments.length > treatmentsPerPage && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link salmon-page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(Math.ceil(filteredTreatments.length / treatmentsPerPage)).keys()].map(number => (
                      <li 
                        key={number + 1} 
                        className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link salmon-page-link"
                          onClick={() => setCurrentPage(number + 1)}
                        >
                          {number + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${indexOfLastTreatment >= filteredTreatments.length ? 'disabled' : ''}`}>
                      <button 
                        className="page-link salmon-page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Patient Information Section */}
        {patientDetails && (
          <Card className="mt-5 patient-info-card">
            <Card.Header className="patient-info-header">
              <h3 >Patient Information</h3>
            </Card.Header>
            <Card.Body>
              {/* Basic Information */}
              <div className="info-section mt-2 mb-4">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('basicInfo')}
                >
                  <h5>
                    <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                    Basic Information
                  </h5>
                  
                </div>
                   <div className="section-content">
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
               </div>

              {/* Emergency Information */}
              <div className="info-section mb-4">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('emergencyInfo')}
                >
                  <h5>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                    Emergency Information
                  </h5>
                  
                </div>
                   <div className="section-content">
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
               </div>

              {/* Insurance Information */}
              <div className="info-section mb-4">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('insuranceInfo')}
                >
                  <h5>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                    Insurance Details
                  </h5>
                   
                </div>
                   <div className="section-content">
                    <Row>
                      <Col md={6}>
                        <InfoItem label="Card Number" value={patientDetails.insurance?.cardNumber || 'N/A'} />
                      </Col>
                      <Col md={6}>
                        <InfoItem label="Provider" value={patientDetails.insurance?.provider || 'N/A'} />
                      </Col>
                    </Row>
                  </div>
               </div>

              {/* Contact Information */}
              <div className="info-section mb-4">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('contactInfo')}
                >
                  <h5>
                    <FontAwesomeIcon icon={faAddressBook} className="me-2" />
                    Contact Person
                  </h5>
               
                </div>
                   <div className="section-content">
                    <Row>
                      <Col md={6}>
                        <InfoItem label="Name" value={patientDetails.contact?.name || 'N/A'} />
                        <InfoItem label="Relation" value={patientDetails.contact?.relation || 'N/A'} />
                      </Col>
                      <Col md={6}>
                        <InfoItem label="Phone" value={patientDetails.contact?.phone || 'N/A'} />
                        <InfoItem label="Email" value={patientDetails.contact?.email || 'N/A'} />
                      </Col>
                    </Row>
                  </div>
               </div>

              {/* Timestamps */}
              <div className="info-section">
                <div 
                  className="section-header"
                  onClick={() => toggleSection('timestamps')}
                >
                  <h5>
                    <FontAwesomeIcon icon={faClock} className="me-2" />
                    Timestamps
                  </h5>
                 
                </div>
                   <div className="section-content">
                    <InfoItem label="Arrival Time" value={new Date(patientDetails.arrivalTime).toLocaleString()} />
                    <InfoItem label="Created At" value={new Date(patientDetails.createdAt).toLocaleString()} />
                    <InfoItem label="Updated At" value={new Date(patientDetails.updatedAt).toLocaleString()} />
                  </div>
               </div>
            </Card.Body>
          </Card>
        )}

        {/* Statistics Section */}
        <Card className="mt-5 stats-card">
          <Card.Body>
            <h2 className="text-center mb-5">Treatment Statistics</h2>
            
            <Row className="g-4">
              {/* Monthly Stats */}
              <Col lg={4}>
                <Card className="h-100 stat-card">
                  <Card.Body>
                    <h3 className="stat-title">Monthly Treatment Trends</h3>
                    {monthlyData ? (
                      <Line 
                        data={monthlyData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="salmon" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Success Rate by Doctor */}
              <Col lg={4}>
                <Card className="h-100 stat-card">
                  <Card.Body>
                    <h3 className="stat-title">Success Rate by Doctor</h3>
                    {successRateData ? (
                      <Bar 
                        data={successRateData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              display: false
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Success Rate (%)'
                              }
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="salmon" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              {/* Category Stats */}
              <Col lg={4}>
                <Card className="h-100 stat-card">
                  <Card.Body>
                    <h3 className="stat-title">Treatments by Category</h3>
                    {categoryData ? (
                      <Pie 
                        data={categoryData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="salmon" />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      {/* Custom Styles */}
      <style jsx global>{`
        :root {
          --salmon: #ff6b6b;
          --salmon-light: #ff8e8e;
          --salmon-dark: #e05454;
          --salmon-bg: #fff5f5;
          --salmon-text: #5c2e2e;
        }
        
        body {
          background-color: #f8f9fa;
        }
        
        /* Toast Styles */
        .salmon-toast {
          background-color: var(--salmon-bg);
          color: var(--salmon-text);
          border-left: 5px solid var(--salmon);
        }
        
        .salmon-progress {
          background: var(--salmon);
        }
        
        /* Button Styles */
        .btn-salmon {
          background-color: var(--salmon);
          border-color: var(--salmon);
          color: white;
        }
        
        .btn-salmon:hover {
          background-color: var(--salmon-dark);
          border-color: var(--salmon-dark);
        }
        
        .btn-salmon-light {
          background-color: var(--salmon-light);
          border-color: var(--salmon-light);
          color: white;
        }
        .br{
        border-radius: 15px;
        
        }
        .btn-salmon-light:hover {
          background-color: var(--salmon);
          border-color: var(--salmon);
        }
        
        .btn-salmon-dark {
          background-color: var(--salmon-dark);
          border-color: var(--salmon-dark);
          color: white;
        }
        
        .btn-salmon-dark:hover {
          background-color: var(--salmon);
          border-color: var(--salmon);
        }
        
        .btn-salmon-outline {
          background-color: transparent;
          border-color: var(--salmon);
          color: var(--salmon);
        }
        
        .btn-salmon-outline:hover {
          background-color: var(--salmon-bg);
          color: var(--salmon-dark);
        }
        
        .btn-salmon-danger {
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }
        
        .btn-salmon-danger:hover {
          background-color: #bb2d3b;
          border-color: #b02a37;
        }
        
        /* Card Styles */
        .salmon-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          background-color: white;
        }
        
        .salmon-card .card-header {
          background-color: var(--salmon);
          color: white;
          border-radius: 12px 12px 0 0 !important;
        }
        
        .treatment-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .treatment-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        .treatment-title {
          color: var(--salmon-dark);
          font-weight: 600;
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .treatment-status .badge {
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
          font-weight: 500;
        }
        
        .treatment-dates {
          display: flex;
          gap: 1rem;
          margin: 1rem 0;
        }
        
        /* Form Styles */
        .salmon-input {
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
        
        .salmon-input:focus {
          border-color: var(--salmon-light);
          box-shadow: 0 0 0 0.25rem rgba(255, 107, 107, 0.25);
        }
        
        .salmon-select {
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }
        
        .salmon-select:focus {
          border-color: var(--salmon-light);
          box-shadow: 0 0 0 0.25rem rgba(255, 107, 107, 0.25);
        }
        
        /* React Select Styles */
        .salmon-react-select .select__control {
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          min-height: 44px;
          transition: all 0.3s ease;
        }
        
        .salmon-react-select .select__control--is-focused {
          border-color: var(--salmon-light);
          box-shadow: 0 0 0 1px var(--salmon-light);
        }
        
        .salmon-react-select .select__option--is-focused {
          background-color: var(--salmon-bg);
        }
        
        .salmon-react-select .select__option--is-selected {
          background-color: var(--salmon);
        }
        
        /* Pagination Styles */
        .salmon-page-link {
          color: var(--salmon);
          border: 1px solid #dee2e6;
        }
        
        .salmon-page-link:hover {
          color: var(--salmon-dark);
          background-color: var(--salmon-bg);
          border-color: #dee2e6;
        }
        
        .page-item.active .salmon-page-link {
          background-color: var(--salmon);
          border-color: var(--salmon);
          color: white;
        }
        
        /* Patient Info Section */
        .patient-info-card {
          border: none;
          
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .patient-info-header {
          background-color: var(--salmon);
                    color: #dee2e6;
          border-radius: 12px 12px 0 0 !important;
          font-weight: 600;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: var(--salmon-bg);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .section-header:hover {
          background-color: #ffebeb;
        }
        
        .section-header h5 {
          color: var(--salmon-dark);
          margin: 0;
          font-weight: 600;
        }
        
        .toggle-icon {
          color: var(--salmon);
          transition: transform 0.3s ease;
        }
        
        .section-content {
          padding: 1rem;
          background-color: white;
          border-radius: 0 0 8px 8px;
          margin-top: 0.5rem;
        }
        
        /* Stats Section */
        .stats-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          background-color: white;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          border: none;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .stat-title {
          color: var(--salmon-dark);
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        /* Badges */
        .badge-salmon {
          background-color: var(--salmon);
        }
        
        .badge-salmon-light {
          background-color: var(--salmon-light);
        }
        
        .stat-badge {
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
          font-weight: 500;
        }
        
        /* Page Title */
        .page-title {
          color: var(--salmon-dark);
          font-weight: 600;
          position: relative;
          padding-bottom: 0.5rem;
        }
        
        .page-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background-color: var(--salmon);
        }
        
        /* Action Buttons */
        .action-btn {
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }
        
        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .treatment-dates {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .section-header h5 {
            font-size: 1rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ShowPatientTreatments;