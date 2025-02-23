var express = require("express");
var router = express.Router();
const Employee = require("../models/Employee")



router.post("/addEmployee", async (req, res, next) => {
  try {
    // Extraire les données du corps de la requête
    const {
      cin,
      name,
      familyName,
      birthday,
      gender,
      phone,
      role,
      email,
      password,
      joinDate,
      adresse,
      status,
      qualifications,
    } = req.body

    // Créer un nouvel employé
    const employee = new Employee({
      cin,
      name,
      familyName,
      birthday,
      gender,
      phone,
      role,
      email,
      password,
      joinDate,
      adresse,
      status,
      qualifications,
    })

    // Sauvegarder l'employé dans la base de données
    await employee.save()

    // Renvoyer une réponse JSON avec l'employé créé
    res.status(201).json({
      message: "Employé créé avec succès",
      employee,
    })
  } catch (error) {
    // Gérer les erreurs
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message })
    }
    next(error)
  }
})

  router.get(
    '/profile',
    (req, res, next) => {
      res.json({
        message: 'You made it to the secure route',
        user: req.user,
        token: req.query.secret_token
      })
    }
  );
  // Statistiques des employés par rôle
router.get("/stats/role", async (req, res) => {
  try {
    const roleStats = await Employee.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    res.json(roleStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Statistiques des employés par genre
router.get("/stats/gender", async (req, res) => {
  try {
    const genderStats = await Employee.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    res.json(genderStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Endpoint pour récupérer les statistiques des employés par statut
router.get("/stats/status", async (req, res) => {
  try {
    const statusStats = await Employee.aggregate([
      {
        $group: {
          _id: "$status", // Grouper par statut
          count: { $sum: 1 }, // Compter le nombre d'employés pour chaque statut
        },
      },
    ]);

    // Transformer les données pour les adapter au PieChart
    const formattedStats = statusStats.map((stat) => ({
      name: stat._id, // Statut (active, on_leave, retired)
      value: stat.count, // Nombre d'employés
    }));

    res.status(200).json(formattedStats);
  } catch (err) {
    console.error("Erreur lors de la récupération des statistiques :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


  module.exports = router;