const express = require('express');

const router = express.Router();
const {
  patientController,
  getPatientsController,
  updatePatientController,
  deletePatientController,
  getAllPatientss,
  getPatientByIdController,
  triagePatientController
} = require('../controllers/patientController');
router.get('/', getAllPatientss);

// Route pour créer un patient
router.post('/patients', patientController);

// Route pour récupérer tous les patients
router.get('/patients', getPatientsController);

// Route pour supprimer un patient
router.delete('/patients/:id', deletePatientController);

// Route pour mettre à jour un patient
router.put('/patients/:id', updatePatientController);

// Route pour récupérer un patient
router.get('/patients/:id', getPatientByIdController);
router.put('/patients/:id/triage', triagePatientController);

module.exports = router;
 