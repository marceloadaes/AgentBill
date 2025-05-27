import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { data, type, name } = req.body;
  const key = req.cookies.openaiKey;
  if (!data || !type || !key) {
    res.status(400).json({ error: 'Missing data or API key' });
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
        model: 'gpt-4-vision-preview',
        messages: [
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
    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to call OpenAI' });
  }
}
