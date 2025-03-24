const Shift = require("../models/shift.model");
const express = require("express");
const router = express.Router();

// Create a new shift
router.post("/", async (req, res, next) => {
  try {
    // Extract shift details from request body
    const { shiftType, area, employees, date } = req.body;
    console.log(req.body)

    // // Validate required fields
    // if (!shiftType || !area || !employees || !date) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    // // Ensure employees follow staffing rules
    // const staffingRules = {
    //   Triage: { "Triage Nurse": 2 },
    //   Resuscitation: { Doctor: 2, Nurse: 6 },
    //   Major_Trauma: { Doctor: 1, Nurse: 2 },
    //   General_ED: { Receptionist: 1, Ambulance_driver: 2 },
    // };

    // if (staffingRules[area]) {
    //   const requiredRoles = staffingRules[area];

    //   for (const role in requiredRoles) {
    //     const requiredCount = requiredRoles[role];
    //     const assignedCount = employees[role] ? Object.keys(employees[role]).length : 0;

    //     if (assignedCount < requiredCount) {
    //       return res.status(400).json({ error: `Not enough ${role}s assigned. Required: ${requiredCount}` });
    //     }
    //   }
    // }

    // Create new shift instance
    const newShift = new Shift({
       shiftType,
      area,
      employees,
      date,
    });

    // Save to database
    await newShift.save();

    // Send response
    res.status(201).json({ message: "Shift created successfully", shift: newShift });

  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res, next) => {
  try {
    const shifts = await Shift.find();
    // Send response
    res.json(shifts);

  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.json({ error: "Internal Server Error" , error});
  }
});

module.exports = router;
