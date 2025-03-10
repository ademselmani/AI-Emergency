import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion'; // Importation de framer-motion pour les animations

const ShowPatientTreatments = () => {
  const location = useLocation();
  const selectedPatient = location.state ? location.state.patient : null;
  const patientId = selectedPatient ? selectedPatient._id : null;

  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(1); // Pagination (par exemple, 10 éléments par page)

  // Récupérer les médecins
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3000/employee/employees/doctor');
        setDoctors(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des médecins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Récupérer les traitements du patient
  useEffect(() => {
    if (patientId) {
      const fetchTreatments = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/treatments/patient/${patientId}`);
          setTreatments(response.data);
          setFilteredTreatments(response.data);
        } catch (error) {
          console.error('Erreur lors de la récupération des traitements:', error);
        }
      };

      fetchTreatments();
    }
  }, [patientId]);

  // Filtrer les traitements
  useEffect(() => {
    let results = treatments;

    // Recherche en temps réel
    if (searchTerm) {
      results = results.filter((treatment) =>
        treatment.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.status.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tri par critères
    if (sortCriteria === 'category') {
      results.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortCriteria === 'status') {
      results.sort((a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1));
    }

    setFilteredTreatments(results);
  }, [searchTerm, sortCriteria, treatments]);

  const getDoctorNameById = (doctorId) => {
    const doctor = doctors.find((doc) => doc._id === doctorId);
    return doctor ? `${doctor.name} (${doctor.specialization})` : 'Médecin inconnu';
  };

  return (
    <div className="container mt-5">
      <div className="patient-header">
        <div className="patient-info">
          <h2>{selectedPatient?.name} {selectedPatient?.familyName}</h2>
          <p><strong>CIN:</strong> {selectedPatient?.cin}</p>
          <p><strong>Date de naissance:</strong> {new Date(selectedPatient?.dateOfBirth).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Chargement des traitements */}
      {loading ? (
        <div className="d-flex justify-content-center mt-4">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <h2 className="my-4">Traitements Médicaux</h2>

          {/* Recherche avancée */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par détails, catégorie, ou statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tri avancé */}
          <div className="mb-3">
            <Select
              options={[
                { value: '', label: 'Trier par...' },
                { value: 'category', label: 'Catégorie' },
                { value: 'status', label: 'Statut' },
              ]}
              onChange={(selectedOption) => setSortCriteria(selectedOption.value)}
              placeholder="Trier par..."
            />
          </div>

          {/* Liste des traitements */}
          <motion.div className="row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {filteredTreatments.length > 0 ? (
              filteredTreatments.map((treatment) => (
                <div key={treatment._id} className="col-md-4 mb-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{treatment.category}</h5>
                      <p className="card-text">
                        <strong>Statut:</strong> {treatment.status ? 'Actif' : 'Terminé'}
                      </p>
                      <p className="card-text"><strong>Détails:</strong> {treatment.details}</p>
                      <p className="card-text">
                        <strong>Date de début:</strong> {new Date(treatment.startDate).toLocaleDateString()}
                      </p>
                      <p className="card-text">
                        <strong>Date de fin:</strong> {treatment.endDate ? new Date(treatment.endDate).toLocaleDateString() : 'En cours'}
                      </p>
                      <p className="card-text">
                        <strong>Traité par:</strong> {getDoctorNameById(treatment.treatedBy)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Aucun traitement trouvé.</p>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ShowPatientTreatments;
