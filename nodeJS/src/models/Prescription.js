const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  medication: { type: String, required: true },
  writtenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à un utilisateur
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // Référence au patient
});

module.exports = mongoose.model('Prescription', prescriptionSchema);