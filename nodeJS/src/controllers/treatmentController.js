const Treatment = require('../models/Treatment');
const DeepLController = require('./DeepLController'); // Import the DeepL translation controller

 
// Créer un traitement
// Créer un traitement
exports.createTreatment = async (req, res) => {
  try {
    const { category, details, startDate, endDate, treatedBy, equipment } = req.body;
    const { patientId } = req.params;
    const status = endDate ? false : true;

    // Vérification des champs requis
    if (!category || !treatedBy || !patientId) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Vérification que treatedBy et equipment sont des ObjectId valides
    if (!treatedBy.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'ID de médecin invalide' });
    }
    if (equipment && !equipment.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'ID d\'équipement invalide' });
    }

    // Création du traitement
    const treatment = new Treatment({
      category,
      status,
      details,
      startDate,
      endDate,
      treatedBy,  // Liste des médecins
      patient: patientId,
      equipment,  // Liste des équipements
    });

    await treatment.save();
    res.status(201).json(treatment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


 

exports.getTreatmentsByPatient = async (req, res) => {
  try {
    const treatments = await Treatment.find({ patient: req.params.patientId });
    
    // If treatments are found, translate the description field (or other relevant fields)
    if (treatments.length > 0) {
      const targetLanguage = req.query.language || 'EN'; // Default to 'EN', or use the language query parameter

      // Translate descriptions (or any other field you want)
      const translatedTreatments = await Promise.all(
        treatments.map(async (treatment) => {
          try {
            if (treatment.details) {
              treatment.details = await DeepLController.translateText(treatment.details, targetLanguage);
            }
            return treatment;
          } catch (error) {
            console.error(`Error translating treatment ${treatment._id}:`, error);
            return treatment; // Return the original treatment in case of a translation error
          }
        })
      );
      
      res.status(200).json(translatedTreatments);
    } else {
      res.status(404).json({ message: 'Aucun traitement trouvé pour ce patient' });
    }
  } catch (error) {
    console.error('Error fetching treatments:', error);
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
    const { category, details, startDate, endDate, treatedBy, patient } = req.body;
    const status = endDate ? false : true;

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
  
}



 
// Statistiques mensuelles des traitements
// Obtenir les statistiques mensuelles
exports.getMonthlyTreatmentStats = async (req, res) => {
  try {
    const { patientId } = req.params;

    const stats = await Treatment.aggregate([
      {
        $match: { patient: new mongoose.Types.ObjectId(patientId) } // Use `new` for ObjectId
      },
      {
        $group: {
          _id: { month: { $month: "$startDate" }, year: { $year: "$startDate" } },
          active: { $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", false] }, 1, 0] } },
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in getMonthlyTreatmentStats:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques mensuelles', message: error.message });
  }
};

 
// Statistiques par catégorie
exports.getTreatmentByCategoryStats = async (req, res) => {
  try {
    const { patientId } = req.params;

    const stats = await Treatment.aggregate([
      { $match: { patient: new mongoose.Types.ObjectId(patientId) } }, // Correct ObjectId instantiation
      {
        $group: {
          _id: "$category", // Group by category
          count: { $sum: 1 },
          avgDuration: {
            $avg: {
              $divide: [
                { $subtract: [{ $ifNull: ["$endDate", new Date()] }, "$startDate"] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuccessRateByDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;

    const stats = await Treatment.aggregate([
      {
        $match: { patient: new mongoose.Types.ObjectId(patientId) }
      },
      { $unwind: "$treatedBy" },
      {
        $group: {
          _id: "$treatedBy",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", false] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          doctorId: "$_id",
          successRate: { $divide: ["$completed", "$total"] },
          totalTreatments: "$total",
          completedTreatments: "$completed"
        }
      },
      {
        $lookup: {
          from: "employees", // Replace with your actual doctor collection name
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor"
        }
      },
      {
        $unwind: {
          path: "$doctor",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          doctorId: 1,
          successRate: 1,
          totalTreatments: 1,
          completedTreatments: 1,
          name: { $ifNull: ["$doctor.name", "Unknown"] },
          familyName: { $ifNull: ["$doctor.familyName", ""] }
        }
      },
      { $sort: { successRate: -1 } }
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



///////////////////////////
exports.getAllTreatmentsInDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate et endDate sont requis' });
    }

    const treatments = await Treatment.find({
      startDate: { $gte: new Date(startDate) },
      endDate: { $lte: new Date(endDate) }
      
    })
      .populate('patient')
      .populate('treatedBy', 'name familyName') // Ajuste selon ton schéma User
      .populate('equipment');

    res.status(200).json(treatments);
  } catch (error) {
    console.error('Erreur dans getAllTreatmentsInDateRange:', error);
    res.status(500).json({ error: 'Erreur serveur', message: error.message });
  }
};

/////////////////////////////////////////////////////////////
const { PythonShell } = require('python-shell');
const path = require('path'); // Make sure to require path module

// PythonShell options
let options = {
  pythonPath: 'C:/Users/Administrator/AppData/Local/Programs/Python/Python313/python.exe', // Update your Python path here
  scriptPath: 'src/models', // Path to where your Python script is located
};

PythonShell.run('detect_anomalies.py', options, function (err, results) {
  if (err) throw err;
  console.log('results:', results);
});

// Express controller for handling anomaly detection request
const { spawn } = require('child_process');
 
exports.detectAnomalies = async (req, res) => {
  try {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../models/detect_anomalies.py')
    ]);

    let data = '';
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    pythonProcess.stderr.on('data', (err) => {
      console.error('Python stderr:', err.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Python script failed' });
      }

      try {
        // Nettoyer les sauts de ligne ou autres caractères inutiles
        const cleanData = data.trim();

        const result = JSON.parse(cleanData);
        res.status(200).json(result);
      } catch (e) {
        console.error('Failed to parse Python output:', data);
        res.status(500).json({ error: 'Failed to parse Python output' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
