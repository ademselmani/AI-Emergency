const express = require('express');
const treatmentController = require('../controllers/treatmentController');

const router = express.Router();

// Routes spécifiques d'abord
router.get('/anomalies', treatmentController.detectAnomalies);
router.get('/monthly-stats/:patientId', treatmentController.getMonthlyTreatmentStats);
router.get('/success-rate-by-doctor/:patientId', treatmentController.getSuccessRateByDoctor);
router.get('/category-stats/:patientId', treatmentController.getTreatmentByCategoryStats);
router.get('/all/stats', treatmentController.getAllTreatmentsInDateRange);
router.get('/patient/:patientId', treatmentController.getTreatmentsByPatient);

// Ensuite les routes dynamiques
router.post('/:patientId', treatmentController.createTreatment);
router.get('/:id', treatmentController.getTreatmentById);
router.put('/:id', treatmentController.updateTreatment);
router.delete('/:id', treatmentController.deleteTreatment);

module.exports = router;
