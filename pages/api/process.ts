import type { NextApiRequest, NextApiResponse } from 'next';

interface Fields {
  nomeConta: string;
  cedente: string;
  tipo: string;
  valor: string;
  vencimento: string;
  codigoBarras: string;
}

interface ProcessResponse {
  fields: Fields;
  confidence: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProcessResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { data, type } = req.body;
  const key = req.cookies.openaiKey;
  if (!data || !type || !key) {
    res.status(400).json({ error: 'Missing data or API key' });
    return;
  }

  const MAX_BYTES = 1024 * 1024;
  const byteLength = Buffer.byteLength(data, 'base64');
  if (byteLength > MAX_BYTES) {
    res.status(400).json({ error: 'Arquivo excede o limite de 1MB.' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Responda somente com um objeto JSON contendo os campos: nomeConta, cedente, tipo, valor, vencimento, codigoBarras e confidence (0-1).',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extraia os dados da conta desta imagem.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${type};base64,${data}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res
        .status(response.status)
        .json({ error: `OpenAI API error: ${text}` });

      return;
    }

    const result = await response.json();
    const content =
      result.choices?.[0]?.message?.content?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      res.status(200).json({
        fields: {
          nomeConta: '',
          cedente: '',
          tipo: '',
          valor: '',
          vencimento: '',
          codigoBarras: '',
        },
        confidence: 0,
      });
      return;
    }

    const fields: Fields = {
      nomeConta: parsed.nomeConta || '',
      cedente: parsed.cedente || '',
      tipo: parsed.tipo || '',
      valor: parsed.valor || '',
      vencimento: parsed.vencimento || '',
      codigoBarras: parsed.codigoBarras || '',
    };

    const keys = Object.keys(fields) as Array<keyof Fields>;
    const filled = keys.filter((k) => fields[k]).length;
    const confidence =
      typeof parsed.confidence === 'number'
        ? parsed.confidence
        : filled / keys.length;

    res.status(200).json({ fields, confidence });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
