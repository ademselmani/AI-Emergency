const express = require("express");
const authMiddleware = require("../middlewares/auth/auth");
const LeaveRequest = require("../models/leave");
const Employee = require('../models/employee.model')
const router = express.Router();


router.get("/stat-by-role", async (req, res) => {
    try {
        const roleStats = await LeaveRequest.aggregate([
            {
                $lookup: {
                    from: "employees", // Verify collection name matches your DB
                    localField: "employee",
                    foreignField: "_id",
                    as: "employeeData"
                }
            },
            { $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { 
                        role: { 
                            $ifNull: ["$employeeData.role", "Unknown"] 
                        },
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.role",
                    statuses: {
                        $push: {
                            status: "$_id.status",
                            count: "$count"
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log("Generated statistics:", JSON.stringify(roleStats, null, 2));
        
        if (!roleStats || roleStats.length === 0) {
            return res.status(404).json({ 
                error: "No leave requests found for statistics generation" 
            });
        }

        res.json(roleStats);
    } catch (err) {
        console.error("Statistics Error:", err);
        res.status(500).json({ 
            error: "Failed to generate statistics",
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});


router.get("/current-leaves-by-role", async (req, res) => {
    try {
      const currentDate = new Date();
      const result = await LeaveRequest.aggregate([
        {
          $match: {
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            status: "approved"
          }
        },
        {
          $lookup: {
            from: "employees",
            localField: "employee",
            foreignField: "_id",
            as: "employeeData"
          }
        },
        { $unwind: "$employeeData" },
        {
          $group: {
            _id: "$employeeData.role",
            count: { $sum: 1 },
            employees: {
              $push: {
                name: "$employeeData.name",
                startDate: "$startDate",
                endDate: "$endDate"
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.post("/request", authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, reason, leaveType } = req.body;

        if (!startDate || !endDate || !reason || !leaveType) {
            return res.status(400).json({ error: "All fields (startDate, endDate, reason, leaveType) are required" });
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: "Start date must be before end date" });
        }

        // Récupérer l'employé et vérifier son quota de congés
        const employee = await Employee.findById(req.user.id);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const leaveDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

        if (employee.leaveQuota < leaveDays) {
            return res.status(400).json({ error: "Not enough leave quota available" });
        }

        // Création de la demande
        const leaveRequest = new LeaveRequest({
            employee: req.user.id,
            startDate,
            endDate,
            reason,
            leaveType,
            status: "pending",
        });

        await leaveRequest.save();
        res.status(201).json({ message: "Leave request submitted", leaveRequest });

    } catch (error) {
        console.error("Error in POST /request:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
});



router.get("/my-requests", authMiddleware, async (req, res) => {
    try {
        const requests = await LeaveRequest.find({ employee: req.user.id }).sort({ startDate: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/requests", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const requests = await LeaveRequest.find().populate("employee", "name email").sort({ startDate: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.put("/approve/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const request = await LeaveRequest.findById(req.params.id).populate("employee");
        if (!request) return res.status(404).json({ error: "Leave request not found" });

        if (request.status !== "pending") {
            return res.status(400).json({ error: "Only pending requests can be approved" });
        }

        const leaveDays = Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1;

        if (request.employee.leaveQuota < leaveDays) {
            return res.status(400).json({ error: "Not enough leave quota available" });
        }

        // Décrémente le quota de congés de l'employé
        request.employee.leaveQuota -= leaveDays;
        await request.employee.save();

        request.status = "approved";
        await request.save();

        res.json({ message: "Leave request approved", request });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.put("/reject/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const request = await LeaveRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ error: "Leave request not found" });

        request.status = "rejected";
        await request.save();

        res.json({ message: "Leave request rejected", request });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const request = await LeaveRequest.findById(req.params.id).populate("employee", "name email");
        if (!request) return res.status(404).json({ error: "Leave request not found" });

        if (req.user.role !== "admin" && request.employee._id.toString() !== req.user.id) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params
      const leave = await LeaveRequest.findByIdAndDelete(id)
  
      if (!leave) {
        return res.status(404).json({ message: "leave non trouvé" })
      }
  
      res.status(204).send() 
    } catch (err) {
      console.error("Error during deletion:", err) 
      res
        .status(500)
        .json({ message: "Erreur serveur lors de la suppression de leave" })
    }
  });
  
  router.get("/", authMiddleware, async (req, res) => {
    const { status } = req.query;

    if (!status) {
        return res.status(400).json({ error: "Le paramètre 'status' est requis" });
    }

    try {
        // Recherche des demandes de congé avec le statut spécifié
        const leaveRequests = await LeaveRequest.find({ status })
            .populate("employee", "name email");

        if (leaveRequests.length === 0) {
            return res.status(404).json({ error: "Aucune demande de congé trouvée pour ce statut" });
        }

        // Vérification des droits d'accès pour un utilisateur non administrateur
        if (req.user.role !== "admin") {
            const filteredRequests = leaveRequests.filter(request =>
                request.employee._id.toString() === req.user.id
            );

            if (filteredRequests.length === 0) {
                return res.status(403).json({ error: "Accès refusé : aucune demande de congé trouvée pour vous" });
            }

            return res.json(filteredRequests);
        }

        // Si l'utilisateur est un administrateur, retourne toutes les demandes de congé
        res.json(leaveRequests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur du serveur" });
    }
});



module.exports = router;