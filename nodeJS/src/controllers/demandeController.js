const Demande = require("../models/demande");
const twilio = require("twilio")
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
require('dotenv').config();
exports.creerDemande = async (req, res) => {
  try {
    const { name, phone, position } = req.body;
    const demande = new Demande({ name, phone, position });
    await demande.save();
    res.status(201).json(demande);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDemandes = async (req, res) => {
  try {
    const demandes = await Demande.find();
    res.json(demandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.accepterDemande = async (req, res) => {
  try {
    const { id } = req.params;
    const demande = await Demande.findByIdAndUpdate(id, { status: "Acceptée" }, { new: true });

    if (!demande) {
      return res.status(404).json({ error: "Demande non trouvée." });
    }

    // Correction ici
    const phoneNumber = demande.phone.toString();
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+216${phoneNumber}`;

    await client.messages.create({
      body: "Your request has been accepted. An ambulance is on its way to you.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    res.json(demande);
  } catch (error) {
    console.error("Erreur envoi SMS:", error);
    res.status(500).json({ error: error.message });
  }
  console.log('TWILIO_SID:', process.env.TWILIO_SID);
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
};

