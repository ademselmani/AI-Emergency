const Patient = require('../models/patient.model');

// Créer un nouveau patient
const createPatient = async (patientData) => {
  try {
    const patient = new Patient(patientData);
    await patient.save();
    return patient;
  } catch (error) {
    throw new Error('Erreur lors de la création du patient: ' + error.message);
  }
};

// Récupérer tous les patients
const getAllPatients = async () => {
  try {
    const patients = await Patient.find(); // Récupère tous les patients
    return patients;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des patients: ' + error.message);
  }
};




// Supprimer un patient
const deletePatient = async (id) => {
  try {
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) throw new Error('Patient introuvable');
    return patient;
  } catch (error) {
    throw new Error('Erreur lors de la suppression du patient: ' + error.message);
  }
};

// Mettre à jour un patient
const updatePatient = async (id, updateData) => {
  try {
    const patient = await Patient.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!patient) throw new Error('Patient introuvable');
    return patient;
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du patient: ' + error.message);
  }
};
// Récupérer un patient par ID
const getPatientById = async (id) => {
  try {
    const patient = await Patient.findById(id);
    if (!patient) throw new Error('Patient introuvable');
    return patient;
  } catch (error) {
    throw new Error('Erreur lors de la récupération du patient: ' + error.message);
  }
};
const updatePatientTriage = async (id, triageData) => {
  try {
    // Ne garder que les champs de triage
    const {
      age,
      painScale,
      source,
      systolicBP,
      o2Saturation,
      temperature,
      triageGrade,
      status
    } = triageData;

    // Map automatique de source → arrivalMode
    const mapSourceToArrival = code => {
      switch (code) {
        case 0: return 'Ambulance';
        case 1: return 'On foot';
        case 2: return 'Other';
        default: return undefined;
      }
    };

    const update = {};
    if (age         !== undefined) update.age         = age;
    if (painScale   !== undefined) update.painScale   = painScale;
    if (source      !== undefined) update.arrivalMode = mapSourceToArrival(source);
    if (systolicBP  !== undefined) update.systolicBP  = systolicBP;
    if (o2Saturation!== undefined) update.o2Saturation= o2Saturation;
    if (temperature !== undefined) update.temperature = temperature;
    if (triageGrade !== undefined) update.triageGrade = triageGrade;
    if (status      !== undefined) update.status      = status;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!patient) throw new Error('Patient introuvable');
    return patient;

  } catch (error) {
    throw new Error('Erreur triage patient : ' + error.message);
  }
};


module.exports = {
  getPatientById,
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
  updatePatientTriage    
};