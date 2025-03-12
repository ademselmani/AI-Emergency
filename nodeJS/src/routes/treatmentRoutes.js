const express = require('express');
const treatmentController = require('../controllers/treatmentController');

const router = express.Router();

router.post('/:patientId', treatmentController.createTreatment);
router.get('/patient/:patientId', treatmentController.getTreatmentsByPatient);
router.get('/:id', treatmentController.getTreatmentById);
router.delete('/:id', treatmentController.deleteTreatment);
router.put('/:id', treatmentController.updateTreatment);

module.exports = router;