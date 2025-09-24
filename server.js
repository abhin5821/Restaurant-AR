// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for testing if required (adjust origins for production)
app.use(cors());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Simple health endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// fallback to index for SPA-ish usage (not strictly needed here)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
