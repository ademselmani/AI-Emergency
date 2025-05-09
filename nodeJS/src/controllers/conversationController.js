// src/controllers/conversationController.js
const Conversation = require('../models/Conversation');

exports.createConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "senderId et receiverId requis" });
  }

  try {
    const convo = new Conversation({
      participants: [senderId, receiverId]
    });
    await convo.save();

    const fullConvo = await Conversation
      .findById(convo._id)
      .populate('participants', 'familyName name');

    req.io.emit('newConversation', fullConvo);

    res.status(201).json(fullConvo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const convos = await Conversation
      .find({ participants: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('participants', 'familyName name');

    res.json(convos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
