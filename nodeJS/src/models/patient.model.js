const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName:     { type: String, required: true },
  lastName:      { type: String, required: true },
  birthDate:     { type: Date,   required: true },
  birthPlace:    { type: String },
  sex:           { type: String, enum: ['Male','Female','Other'], required: true },
  address:       { type: String },
  phone:         { type: String },


  arrivalMode:   { type: String, enum: ['Ambulance','On foot','Other'], required: true },
  arrivalTime:   { type: Date,   default: Date.now },
  emergencyReason: { type: String, required: true },
  insurance: {
    cardNumber: { type: String },
    provider:   { type: String }
  },
  contact: {
    name:     { type: String },
    relation: { type: String },
    phone:    { type: String },
    email:    { type: String }
  },
  observations: { type: String },
  emergencyArea:{ type: String, required: true },

  // --- NOUVEAUX CHAMPS POUR LE TRIAGE ---
  age:           { type: Number },
  painScale:     { type: Number },
  systolicBP:    { type: Number },
  o2Saturation:  { type: Number },
  temperature:   { type: Number },

  triageGrade:   { type: Number },
  status:        { 
    type: String, 
    enum: ['Triage','Critical','Serious','Stable'], 
    default: 'Triage' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);