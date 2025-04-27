const axios = require('axios');
const AI_URL = 'http://localhost:5001';

async function getAnomalies() {
  const res = await axios.get(`${AI_URL}/anomalies`);
  return res.data;
}

async function getForecast() {
  const res = await axios.get(`${AI_URL}/forecast`);
  return res.data;
}

module.exports = { getAnomalies, getForecast };
