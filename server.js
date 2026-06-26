const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/feedback', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const fetch = (...args) => import('node-fetch').then(function(mod) { return mod.default(...args); });

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.9
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini error:', JSON.stringify(data.error));
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.candidates[0].content.parts[0].text;
    res.json({ feedback: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/', function(req, res) {
  res.json({ status: 'Cineoxia backend running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});
