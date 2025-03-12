const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  category: { type: String, enum: ['TRAUMA', 'SURGICAL', 'PSYCHIATRIC', 'RESPIRATORY', 'CARDIAC'], required: true },
  status: { type: Boolean, default: false },
  details: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  treatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Référence à un utilisateur
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, // Référence au patient
});

module.exports = mongoose.model('Treatment', treatmentSchema);