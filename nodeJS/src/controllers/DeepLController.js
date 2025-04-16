const axios = require('axios');

// DeepL Translation Service Controller
class DeepLController {
  constructor() {
    // Directly placing the API Key in the code
    this.apiKey = 'b2c58875-8344-4581-bdf6-2204fa8ec37e:fx'; // Replace with your actual API key
    this.baseURL = 'https://api-free.deepl.com/v2/translate';
  }

  /**
   * Translate text using DeepL API.
   *
   * @param {string} text The text to translate.
   * @param {string} targetLanguage The target language code (e.g., 'EN', 'FR').
   * @return {Promise<string>} The translated text.
   * @throws {Error} If the translation fails.
   */
  async translateText(text, targetLanguage = 'EN') {
    if (!text) {
      throw new Error('Text is required for translation');
    }

    try {
      const response = await axios.post(this.baseURL, null, {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        },
        params: {
          text,
          target_lang: targetLanguage,
        },
      });

      // Return the translated text
      return response.data.translations[0]?.text || text;
    } catch (error) {
      throw new Error(`Translation failed: ${error.message}`);
    }
  }
}

module.exports = new DeepLController(); // Export the controller instance
