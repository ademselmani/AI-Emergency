const express = require("express");
const authMiddleware = require("../middlewares/auth/auth");
const LeaveRequest = require("../models/leave");
const Employee = require('../models/employee.model');
const router = express.Router();
const nodemailer = require('nodemailer');
const config = require('../config/db.json');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

// Compter les demandes de congé en attente
router.get('/pending-count', authMiddleware, async (req, res) => {
  try {
    const count = await LeaveRequest.countDocuments({ 
      status: "pending",
      ...(req.user.role !== "admin" && { employee: req.user.id })
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistiques par rôle
router.get("/stat-by-role", async (req, res) => {
  try {
    const roleStats = await LeaveRequest.aggregate([
      {
        $lookup: {
          from: "employees", 
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

    if (!roleStats || roleStats.length === 0) {
      return res.status(404).json({ error: "No leave requests found" });
    }

    res.json(roleStats);
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to generate statistics",
      details: err.message
    });
  }
});

// Congés en cours par rôle
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

// Soumettre une demande de congé
router.post("/request", authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, reason, leaveType } = req.body;

    if (!startDate || !endDate || !reason || !leaveType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "Start date must be before end date" });
    }

    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leaveDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (employee.leaveQuota < leaveDays) {
      return res.status(400).json({ error: "Not enough leave quota available" });
    }

    const leaveRequest = new LeaveRequest({
      employee: req.user.id,
      startDate,
      endDate,
      reason,
      leaveType,
      status: "pending",
    });

    await leaveRequest.save();
    
    // Émettre un événement pour la nouvelle demande
    req.io.emit("newLeaveRequest", {
      userId: req.user.id,
      role: req.user.role
    });
    
    res.status(201).json({ message: "Leave request submitted", leaveRequest });
  } catch (error) {
    console.error("Error in POST /request:", error); // Ajoute ceci
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Obtenir mes demandes
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ employee: req.user.id }).sort({ startDate: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Obtenir toutes les demandes (admin seulement)
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

// Approuver une demande (admin seulement)
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

    request.employee.leaveQuota -= leaveDays;
    //await request.employee.save();

    request.status = "approved";
    await request.save();

    // Envoyer un email de confirmation
    try {
      const mailOptions = {
        from: `HR System <${config.email.user}>`,
        to: request.employee.email,
        subject: 'Your leave request has been approved',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2e7d32;">Approved leave request</h2>
            <p>Dear ${request.employee.name},</p>
            <p>Your leave request has been <strong>approved</strong>.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0;">Leave details:</h3>
              <p><strong>Type:</strong> ${request.leaveType}</p>
              <p><strong>From:</strong> ${new Date(request.startDate).toLocaleDateString()}</p>
              <p><strong>To:</strong> ${new Date(request.endDate).toLocaleDateString()}</p>
              <p><strong>Duration:</strong> ${leaveDays} day(s)</p>
              <p><strong>Remaining quota:</strong> ${request.employee.leaveQuota} day(s)</p>
            </div>
            <p>Best regards,<br>The Human Resources Team</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    // Émettre un événement de mise à jour
    req.io.emit("leaveRequestUpdated", {
      requestId: request._id,
      status: "approved",
      employeeId: request.employee._id
    });
    
    res.json({ 
      message: "Leave request approved successfully", 
      request,
      emailSent: true
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Server error",
      details: error.message
    });
  }
});

// Rejeter une demande (admin seulement)
router.put("/reject/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const request = await LeaveRequest.findById(req.params.id).populate("employee");
    if (!request) return res.status(404).json({ error: "Leave request not found" });

    request.status = "rejected";
    await request.save();

    // Envoyer un email de notification
    try {
      const mailOptions = {
        from: `HR System <${config.email.user}>`,
        to: request.employee.email,
        subject: 'Your leave request has been rejected',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Leave request rejected</h2>
            <p>Dear ${request.employee.name},</p>
            <p>We regret to inform you that your leave request has been <strong>rejected</strong>.</p>
            <p>Please contact HR for more information.</p>
            <p>Best regards,<br>The Human Resources Team</p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    // Émettre un événement de mise à jour
    req.io.emit("leaveRequestUpdated", {
      requestId: request._id,
      status: "rejected",
      employeeId: request.employee._id
    });
    
    res.json({ 
      message: "Leave request rejected", 
      request,
      emailSent: true
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Obtenir une demande spécifique
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

// Supprimer une demande
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (req.user.role !== "admin" && request.employee.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    
    // Émettre un événement si nécessaire
    if (request.status === "pending") {
      req.io.emit("leaveRequestUpdated", {
        requestId: request._id,
        status: "deleted",
        employeeId: request.employee
      });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Obtenir les demandes par statut
router.get("/", authMiddleware, async (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(400).json({ error: "Status parameter is required" });
  }

  try {
    let query = { status };
    
    if (req.user.role !== "admin") {
      query.employee = req.user.id;
    }

    const leaveRequests = await LeaveRequest.find(query)
      .populate("employee", "name email");

    if (leaveRequests.length === 0) {
      return res.status(404).json({ error: "No leave requests found with this status" });
    }

    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
const chatController = require('../controllers/chatController');
router.post('/chat', chatController);module.exports = router;