const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

const urlDatabase = {};

app.use(cors());
app.use(express.json());
app.post('/generate-short-url', (request, response) => {
  const { originalUrl, validForMinutes, customCode } = request.body;

  if (!originalUrl || typeof originalUrl !== 'string' || !originalUrl.startsWith('http')) {
    return response.status(400).json({ error: 'Please provide a valid URL starting with http/https.' });
  }
  if (validForMinutes && (!Number.isInteger(validForMinutes) || validForMinutes <= 0)) {
    return response.status(400).json({ error: 'Validity period should be a positive whole number (in minutes).' });
  }
  if (customCode && !/^[a-zA-Z0-9]+$/.test(customCode)) {
    return response.status(400).json({ error: 'Custom code must contain only letters and numbers.' });
  }

  const finalCode = customCode || Math.random().toString(36).substr(2, 7);
  const shortLink = `http://min.ly/${finalCode}`;

  const expiryTime = validForMinutes
    ? new Date(Date.now() + validForMinutes * 60 * 1000).toISOString()
    : null;
  urlDatabase[finalCode] = {
    original: originalUrl,
    shortened: shortLink,
    expiresAt: expiryTime
  };

  response.json({
    original: originalUrl,
    shortened: shortLink,
    expiresAt: expiryTime || 'No expiry set'
  });
});
app.get('/', (req, res) => {
  res.send('🎉 URL Shortener API is up and running!');
});

app.listen(PORT, () => {
  console.log(`URL Shortener backend is live at http://localhost:${PORT}`);
});
