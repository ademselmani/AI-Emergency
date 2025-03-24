const mongoose = require("mongoose");

const shiftSchema = mongoose.Schema({
  date: { type: Date, required: true }, // e.g., "2025-03-10"
  shiftType: { type: String, enum: ["Day_shift", "Evening_shift", "Night_shift"], required: true },
  area: { type: String, enum: ["Triage", "Resuscitation", "Major_Trauma", "General_ED"], required: true },
  employees: [{ employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employees" }, role: String }],
});

const Shift = mongoose.model("shifts", shiftSchema);
module.exports = Shift;