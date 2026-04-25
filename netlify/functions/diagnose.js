exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const { nome, negocio, problema, plataformas } = JSON.parse(event.body);

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
    "formato": "nome do formato (ex: Script de Reel, Legenda de Post, Mensagem WhatsApp)",
    "texto": "conteúdo completo pronto a usar, adaptado ao negócio e problema"
  },
  "pacote_recomendado": "Conteúdo OU WhatsApp Poderoso OU Arranque Digital",
  "motivo_pacote": "1 frase explicando porquê este pacote resolve o problema dele"
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro interno. Tenta novamente.' })
    };
  }
};
