const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  category: { type: String, required: true },
  status: { type: Boolean, default: false },
  details: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true }, 

   treatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'employees', required: true }], 
  equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }], 
});

module.exports = mongoose.model('Treatment', treatmentSchema);
