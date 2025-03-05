const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  triageLevel: { type: Number, enum: [1, 2, 3, 4, 5], required: true },
  primaryComplaint: { type: String, required: true },
  arrivalMode: { type: String, enum: ['AMBULANCE', 'WALK_IN', 'WHEELCHAIR', 'OTHER'], required: true },
  airway: { type: String, enum: ['CLEAR', 'PARTIALLY_OBSTRUCTED', 'FULLY_OBSTRUCTED', 'ARTIFICIAL_AIRWAY'], required: true },
  breathing: { type: String, enum: ['NORMAL', 'LABORED', 'SHALLOW', 'ABSENT', 'ASSISTED'], required: true },
  circulation: { type: String, enum: ['NORMAL', 'DECREASED', 'WEAK', 'ABSENT'], required: true },
  disability: { type: String, enum: ['ALERT', 'VOICE_RESPONSIVE', 'PAIN_RESPONSIVE', 'UNRESPONSIVE'], required: true },
  exposure: { type: String, enum: ['NO_TRAUMA', 'MINOR_TRAUMA', 'MAJOR_TRAUMA', 'BURNS', 'HYPOTHERMIA'], required: true },
});

const patientSchema = new mongoose.Schema({
  cin: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  familyName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  status: { type: String, enum: ['RESUSCITATION', 'URGENT', 'LESS_URGENT', 'DISCHARGED', 'DECEASED'], required: true },
  medicalRecords: [medicalRecordSchema],
});

module.exports = mongoose.model('Patient', patientSchema);