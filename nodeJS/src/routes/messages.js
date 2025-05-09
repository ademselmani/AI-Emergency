
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Route pour envoyer un message
router.post('/', messageController.sendMessage);

// Route pour récupérer tous les messages d'une conversation
router.get('/:conversationId', messageController.getMessages);

module.exports = router;
