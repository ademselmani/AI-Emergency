const mongoose = require("mongoose");

const demandeSchema = new mongoose.Schema({
  name: String,
  phone:Number,
  position: {
    lat: Number,
    lng: Number
  },
  status: { type: String, default: "En attente" }, 
}, { timestamps: true });

module.exports = mongoose.model("Demande", demandeSchema);
