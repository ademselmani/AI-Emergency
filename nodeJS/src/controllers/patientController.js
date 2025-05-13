
const { createPatient, getAllPatients , getPatientById , updatePatient, deletePatient, updatePatientTriage} = require('../services/patientService');

// Créer un patient
const patientController = async (req, res) => {
  try {
    const newPatient = await createPatient(req.body);
    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// Récupérer tous les patients
const getPatientsController = async (req, res) => {
  try {
    const patients = await getAllPatients();
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
   }
};

// Supprimer un patient

const deletePatientController = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPatient = await deletePatient(id);
    res.status(200).json({ success: true, message: 'Patient supprimé avec succès', data: deletedPatient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// Mettre à jour un patient
const updatePatientController = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPatient = await updatePatient(id, req.body);
    res.status(200).json({ success: true, message: 'Patient mis à jour avec succès', data: updatedPatient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// Contrôleur pour récupérer un patient par ID
const getPatientByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await getPatientById(id);
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};
const getAllPatientss = async (req, res) => {
  try {
    const patients = await Patient.find();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const triagePatientController = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await updatePatientTriage(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  patientController,
  getAllPatientss,
  getPatientsController,
  deletePatientController,
  updatePatientController,
  getPatientByIdController, 
  triagePatientController// Ajouté ici
 };