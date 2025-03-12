const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  birthPlace: { type: String },
  sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: String },
  phone: { type: String },
  // Informations sur le mode d’arrivée
  arrivalMode: { type: String, enum: ['Ambulance', 'On foot', 'Other'], required: true },
  arrivalTime: { type: Date, default: Date.now },
  // Motif de l’urgence
  emergencyReason: { type: String, required: true },
  // Informations d’assurance
  insurance: {
    cardNumber: { type: String },
    provider: { type: String }
  },
  // Coordonnées de la personne à prévenir
  contact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  // Observations initiales (optionnelles)
  observations: { type: String },

  // Nouveau champ : Statut du patient
  status: { 
    type: String, 
    enum: ['Triage', 'Critical', 'Stable', 'Recovered'], 
    default: 'Triage' 
  },

  // Nouveau champ : Zone d’urgence
  emergencyArea: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });
module.exports = mongoose.model('Patient', patientSchema);
