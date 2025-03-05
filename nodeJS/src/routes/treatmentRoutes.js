const express = require('express');
const treatmentController = require('../controllers/treatmentController');

const router = express.Router();

router.post('/:patientId', treatmentController.createTreatment);
router.get('/patient/:patientId', treatmentController.getTreatmentsByPatient);

module.exports = router;