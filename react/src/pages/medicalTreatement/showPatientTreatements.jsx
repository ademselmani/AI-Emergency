import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Card, Container, Row, Col, Button, Collapse, Spinner, Form, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
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
import TreatmentStatsPage from './TreatmentStatsPage'; // Importez la page des stats
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
    basicInfo: false,
    emergencyInfo: false,
    insuranceInfo: false,
    contactInfo: false,
    timestamps: false
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
    <Container className="mt-5">
      <ToastContainer />
      <Row className="mb-3">
        <Col md={12} className="d-flex justify-content-end">

      


          <Button variant="success" onClick={exportToCSV} className="me-2">
            <FontAwesomeIcon icon={faFileCsv} className="me-2" />
            Export to CSV
          </Button>
          <Button variant="danger" onClick={exportToPDF} className="me-2">
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            Export to PDF
          </Button>
          <Button variant="primary" onClick={sendEmail} disabled={emailLoading}>
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
            {emailLoading ? 'Sending...' : 'Send Email'}
          </Button>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <h2 className="my-4">Medical Monitoring</h2>
           {/* Language Selector */}
           <select
  onChange={(e) => setLanguage(e.target.value)}
  value={language}
  className="mt-2 mb-4 p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
>
  <option value="ar">Arabic - العربية</option>
  <option value="en">English - English</option>
  <option value="fr">French - Français</option>
  <option value="es">Spanish - Español</option>
  <option value="de">German - Deutsch</option>
  <option value="it">Italian - Italiano</option>
  <option value="pt">Portuguese - Português</option>
  <option value="ru">Russian - Русский</option>
  <option value="zh">Chinese (Simplified) - 中文</option>
  <option value="ja">Japanese - 日本語</option>
  <option value="ko">Korean - 한국어</option>
  <option value="nl">Dutch - Nederlands</option>
  <option value="pl">Polish - Polski</option>
  <option value="tr">Turkish - Türkçe</option>
  <option value="sv">Swedish - Svenska</option>
  <option value="uk">Ukrainian - Українська</option>
</select>

          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search treatments..."
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
              <Badge bg="info" className="me-2">
                Active Treatments: {activeTreatments}
              </Badge>
              <Badge bg="secondary">
                Completed Treatments: {completedTreatments}
              </Badge>
            </Col>
          </Row>
          <NavLink
                  to={`/medical-treatments/patient/add/${selectedPatient._id}`}
                  state={{ patient: selectedPatient }}
                  className="btn btn-success d-flex col-2 me-5 align-items-center gap-1"
                >
                  <PlusCircle size={18} /> Add Monitoring
                </NavLink>

          <Row className="mt-4">
            {currentTreatments.length ? (
              currentTreatments.map((treatment) => (
                <Col key={treatment._id} md={4} className="mb-4">
                  <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className="h-100 shadow-sm">
                      <Card.Body>
                        <Card.Title className="text-primary">{treatment.category}</Card.Title>
                        <Card.Text>
                          <strong>Status:</strong> {treatment.status ? (
                            <Badge bg="success">Active</Badge>
                          ) : (
                            <Badge bg="secondary">Completed</Badge>
                          )}
                        </Card.Text>
                        <Card.Text><strong>Details:</strong> {treatment.details}</Card.Text>
                        <Card.Text>
                          <strong>Start:</strong> {new Date(treatment.startDate).toLocaleDateString()}
                        </Card.Text>
                        <Card.Text>
                          <strong>End:</strong> {treatment.endDate ? (
                            new Date(treatment.endDate).toLocaleDateString()
                          ) : (
                            'Ongoing'
                          )}
                        </Card.Text>
                        <Card.Text>
                          <strong>Doctors:</strong> {getDoctorNamesByIds(treatment.treatedBy)}
                        </Card.Text>
                        {treatment.equipment?.length > 0 && (
                          <Card.Text>
                            <strong>Equipment:</strong> {getEquipmentNamesByIds(treatment.equipment)}
                          </Card.Text>
                        )}
                        <div className="d-flex justify-content-between mt-3">
                          <NavLink
                            to={`/medical-treatments/edit/${treatment._id}`}
                            state={{ treatment, patient: selectedPatient }}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </NavLink>
                          <Button
                            variant="danger"
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
                <p className="text-muted text-center">No treatments found matching your criteria.</p>
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

      {patientDetails && (
        <Card className="mt-4 shadow-sm border-primary">
          <Card.Header className="bg-secondary text-white">
            <h3 className="mb-0">Patient Information</h3>
          </Card.Header>
          <Card.Body>
            <div className="info-section mb-4 border-bottom">
              <div
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('basicInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                  Basic Information
                </h5>
               </div>
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
             </div>

            <div className="info-section mb-4 border-bottom">
              <div
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('emergencyInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                  Emergency Information
                </h5>
               </div>
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
             </div>

            <div className="info-section mb-4 border-bottom">
              <div
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('insuranceInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                  Insurance Details
                </h5>
               </div>
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
             </div>

            <div className="info-section mb-4 border-bottom">
              <div
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('contactInfo')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faAddressBook} className="me-2" />
                  Contact Person
                </h5>
               </div>
                 <div className="p-3">
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

            <div className="info-section">
              <div
                className="section-header d-flex justify-content-between align-items-center p-3 bg-light rounded cursor-pointer"
                onClick={() => toggleSection('timestamps')}
              >
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  Timestamps
                </h5>
               </div>
                 <div className="p-3">
                  <InfoItem label="Arrival Time" value={new Date(patientDetails.arrivalTime).toLocaleString()} />
                  <InfoItem label="Created At" value={new Date(patientDetails.createdAt).toLocaleString()} />
                  <InfoItem label="Updated At" value={new Date(patientDetails.updatedAt).toLocaleString()} />
                </div>
             </div>
          </Card.Body>
        </Card>
      )}

<div>
 <div className="container mt-5 p-5 card">
      <h1 className="text-center mb-4 ">Treatment Statistics</h1>
      <div className="row">
        {/* Graph for Monthly Stats */}
        <div className="col-md-4">
          <h2>Monthly Stats</h2>
          {monthlyData && <Line data={monthlyData} />}
        </div>

        {/* Graph for Success Rate by Doctor */}
        <div className="col-md-4">
          <h2>Success Rate by Doctor</h2>
          {successRateData && <Bar data={successRateData} />}
        </div>

        {/* Graph for Category Stats */}
        <div className="col-md-4">
          <h2>Category Stats</h2>
          {categoryData && <Pie data={categoryData} />}
        </div>
      </div>
    </div>      </div>
      
      
          </Container>
  );
};

export default ShowPatientTreatments;