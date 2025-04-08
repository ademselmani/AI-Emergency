const express = require("express");
const { creerDemande, getDemandes, accepterDemande } = require("../controllers/demandeController");
const Demande = require("../models/demande");
const router = express.Router();

router.post("/", creerDemande);        
router.get("/", getDemandes);          
router.put("/:id", accepterDemande);   
router.get('/count', async (req, res) => {
    try {
      const count = await Demande.countDocuments({ status: 'En attente' });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
module.exports = router;
