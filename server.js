const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('.'));

app.post('/diagnose', async (req, res) => {
  try {
    const { nome, negocio, problema, plataformas } = req.body;

    const prompt = `És o agente Fast Result — consultor de resultados digitais para negócios angolanos. Comunica em português de Angola, directo e prático.

Cliente: ${nome}
Negócio: ${negocio}
Problema principal: ${problema}
Presença actual: ${plataformas}

Responde APENAS com JSON puro, sem markdown, sem texto adicional:
{
  "diagnostico": "2 frases directas sobre o problema principal deste negócio",
  "acoes_semana": [
    {"dias": "Dia 1–2", "acao": "acção concreta e específica"},
    {"dias": "Dia 3–4", "acao": "acção concreta e específica"},
    {"dias": "Dia 5–7", "acao": "acção concreta e específica"}
  ],
  "conteudo_pronto": {
    "formato": "nome do formato",
    "texto": "conteúdo completo pronto a usar"
  },
  "pacote_recomendado": "Conteúdo OU WhatsApp Poderoso OU Arranque Digital",
  "motivo_pacote": "1 frase explicando porquê"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const apiData = await response.json();
    const raw = apiData.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
