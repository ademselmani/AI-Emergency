const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');

const router = express.Router();

router.post('/', prescriptionController.createPrescription);
router.get('/patient/:patientId', prescriptionController.getPrescriptionsByPatient);

module.exports = router;