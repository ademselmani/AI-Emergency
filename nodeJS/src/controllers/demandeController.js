const Demande = require("../models/demande");

exports.creerDemande = async (req, res) => {
  try {
    const { name, phone,position } = req.body;
    const demande = new Demande({ name,phone, position });
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
    res.json(demande);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
