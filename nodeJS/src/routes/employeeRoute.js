var express = require("express");
var router = express.Router();
const Employee = require("../models/employee.model")


router.get("/employees", async (req, res) => {
  try {
    // Récupérer tous les employés sauf ceux avec le rôle "admin" et les trier par rôle
    const employees = await Employee.find({ role: { $ne: "admin" } }).sort({
      role: 1,
    }) // 1 pour tri ascendant
    res.json(employees)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.get("/employees/:id", async (req, res) => {
  try {
    // Récupérer l'ID de l'employé à partir des paramètres de la requête
    const { id } = req.params

    // Récupérer l'employé par ID
    const employee = await Employee.findById(id)

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" })
    }

    // Retourner l'employé trouvé
    res.json(employee)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
router.delete("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params
    const employee = await Employee.findByIdAndDelete(id)

    if (!employee) {
      return res.status(404).json({ message: "Employé non trouvé" })
    }

    res.status(204).send() 
  } catch (err) {
    console.error("Error during deletion:", err) 
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la suppression de l'employé" })
  }
})
router.put("/employees/:id", async (req, res) => {
  const { id } = req.params
  const updatedData = req.body

  try {
    // Recherche de l'employé par son ID
    const employee = await Employee.findById(id)

    // Si l'employé n'est pas trouvé
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" })
    }

    // Mise à jour des informations de l'employé
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        $set: updatedData,
      },
      { new: true } // Retourne l'employé mis à jour
    )

    if (!updatedEmployee) {
      throw new Error("Failed to update employee")
    }

    // Retour des données mises à jour
    res.status(200).json(updatedEmployee)
  } catch (error) {
    console.error("Error updating employee:", error.message || error)
    res
      .status(500)
      .json({ message: "Error updating employee data", error: error.message })
  }
})


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
      image,
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
      image,
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
        $match: {
          role: { $ne: "admin" }, // Exclude employees with role "admin"
        },
      },
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
        $match: {
          role: { $ne: "admin" }, // Exclude employees with role "admin"
        },
      },
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
        $match: {
          role: { $ne: "admin" }, // Exclude employees with role "admin"
        },
      },
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
router.get("/employees/doctor", async (req, res) => {
    try {
      // Récupérer tous les employés avec le rôle "doctor"
      const employees = await Employee.find({ role: "doctor" }).sort({
        role: 1,
      }); // 1 pour tri ascendant
      res.json(employees);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;