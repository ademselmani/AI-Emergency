const express = require('express');
const router = express.Router();
const convoCtrl = require('../controllers/conversationController');
const auth = require('../middlewares/auth/auth'); // Chemin vers ton middleware JWT

// Créer une nouvelle conversation
router.post('/', auth, convoCtrl.createConversation);

// Récupérer les conversations de l’utilisateur
router.get('/', auth, convoCtrl.getUserConversations);

module.exports = router;
