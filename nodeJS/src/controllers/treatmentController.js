const Treatment = require('../models/Treatment');

 
// Créer un traitement
exports.createTreatment = async (req, res) => {
  try {
    const { category, status, details, startDate, endDate, treatedBy } = req.body;
    const { patientId } = req.params; // Get patientId from the route

    // Validate that necessary fields are present
    if (!category || !treatedBy || !patientId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new treatment and associate it with the patientId
    const treatment = new Treatment({
      category,
      status,
      details,
      startDate,
      endDate,
      treatedBy,
      patient: patientId, // Use patientId from the URL
    });

    await treatment.save();
    res.status(201).json(treatment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

 

// Obtenir tous les traitements d'un patient
exports.getTreatmentsByPatient = async (req, res) => {
  try {
    const treatments = await Treatment.find({ patient: req.params.patientId });
    res.status(200).json(treatments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir un traitement par son ID
exports.getTreatmentById = async (req, res) => {
  try {
    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }
    res.status(200).json(treatment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un traitement
exports.updateTreatment = async (req, res) => {
  try {
    // Extract allowed fields from req.body
    const { category, status, details, startDate, endDate, treatedBy, patient } = req.body;

    // Create an object with only the fields that can be updated
    const updateData = {
      category,
      status,
      details,
      startDate,
      endDate,
      treatedBy,
      patient,
    };

    // Find and update the treatment
    const treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose validation
      }
    );

    // If treatment is not found, return a 404 error
    if (!treatment) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }

    // Return the updated treatment
    res.status(200).json(treatment);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    // Handle other errors (e.g., database errors)
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du traitement' });
  }
};
// Supprimer un traitement
const mongoose = require('mongoose');

exports.deleteTreatment = async (req, res) => {
  try {
    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de traitement invalide' });
    }

    const treatment = await Treatment.findByIdAndDelete(req.params.id);
    if (!treatment) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }
    res.status(200).json({ message: 'Traitement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtenir tous les traitements (optionnel)
exports.getAllTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find();
    res.status(200).json(treatments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};