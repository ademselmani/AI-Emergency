const mongoose = require("mongoose");

const LeaveRequestSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "employees", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    leaveType: { 
        type: String, 
        enum: ["sick", "vacation", "personal", "maternity", "other"], 
        required: true 
      },  
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
});

module.exports = mongoose.model("leaverequests", LeaveRequestSchema);
