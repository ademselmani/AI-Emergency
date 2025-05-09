const axios = require('axios');
require('dotenv').config(); // charge le fichier .env

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || 'google/flan-t5-small';

const chatController = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Le message est requis.' });
    }

    const formattedPrompt = `You are a medical assistant. Answer clearly and only in English: ${message}`;

    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`,
      { inputs: formattedPrompt },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generatedText = Array.isArray(response.data)
      ? response.data[0]?.generated_text
      : response.data?.generated_text;

    res.status(200).json({
      response: generatedText || 'Aucune réponse générée.',
    });
  } catch (error) {
    console.error('Erreur dans chatController:', error?.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de l\'appel au modèle Hugging Face.',
      details: error?.response?.data || error.message,
    });
  }
};

module.exports = chatController;
