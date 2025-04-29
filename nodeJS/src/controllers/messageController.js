const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

exports.sendMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  try {
    const msg = new Message({
      conversation: conversationId,
      sender: req.user.id,
      text
    });
    await msg.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: Date.now()
    });

    const fullMsg = await msg.populate('sender', 'familyName name');

    req.io.to(conversationId).emit('newMessage', fullMsg);

    res.status(201).json(fullMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// ⚠️ Ceci est probablement ce qui manque
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Message
      .find({ conversation: conversationId })
      .populate('sender', 'familyName name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
