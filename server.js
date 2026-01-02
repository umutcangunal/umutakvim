const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/ask-ai', async (req, res) => {
  try {
    const { question, taskTitle, taskNotes } = req.body;
    
    // Gemini API kullan
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDgx6_xexmCNfpKtDPne-gkwPvENpZ03vA`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Görev: "${taskTitle}"
Notlar: ${taskNotes || 'Yok'}
Soru: ${question}
Türkçe cevap ver.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    
    // Gemini formatını Claude formatına çevir
    const formattedResponse = {
      content: [{
        text: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Cevap yok'
      }]
    };
    
    res.json(formattedResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('✅ AI Backend (Gemini) çalışıyor!');
});