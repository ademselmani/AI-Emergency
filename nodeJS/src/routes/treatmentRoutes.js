const express = require('express');
const treatmentController = require('../controllers/treatmentController');

const router = express.Router();

router.post('/:patientId', treatmentController.createTreatment);
router.get('/patient/:patientId', treatmentController.getTreatmentsByPatient);
router.get('/:id', treatmentController.getTreatmentById);
router.delete('/:id', treatmentController.deleteTreatment);
router.put('/:id', treatmentController.updateTreatment);
 router.get("/monthly-stats/:patientId", treatmentController.getMonthlyTreatmentStats);

 router.get("/success-rate-by-doctor/:patientId", treatmentController.getSuccessRateByDoctor);

 router.get("/category-stats/:patientId", treatmentController.getTreatmentByCategoryStats);

module.exports = router;