import type { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';

interface Fields {
  empresaRecebedora: string;
  pagador: string;
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
    let messages: any;
    const systemMessage = {
      role: 'system',
      content:
        'Responda somente com um objeto JSON contendo:\n- EmpresaRecebedora: entidade que receber\u00e1 o pagamento.\n- Pagador: pessoa ou empresa respons\u00e1vel pelo pagamento.\n- Tipo: categoria do servi\u00e7o.\n- Valor: total a pagar.\n- Vencimento: data limite de pagamento.\n- Codigo de Barras: sequ\u00eancia num\u00e9rica do c\u00f3digo de barras.\n- Confianca: valor entre 0 e 100 representando sua certeza geral.',
    };

    if (type === 'application/pdf') {
      const pdfBuffer = Buffer.from(data, 'base64');
      let text = '';
      try {
        const result = await pdfParse(pdfBuffer);
        text = result.text.trim();
      } catch {
        // ignore parse errors
      }
      if (!text) {
        res.status(400).json({ error: 'Nenhum texto encontrado no PDF.' });
        return;
      }
      messages = [systemMessage, { role: 'user', content: text }];
    } else {
      messages = [
        systemMessage,
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
      ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
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
    let content =
      result.choices?.[0]?.message?.content?.trim() || '{}';
    const match = content.match(/```(?:json)?\n([\s\S]*?)\n```/i);
    if (match) {
      content = match[1];
    }
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      res.status(200).json({
        fields: {
          empresaRecebedora: '',
          pagador: '',
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
      empresaRecebedora: parsed['EmpresaRecebedora'] || parsed.empresaRecebedora || '',
      pagador: parsed['Pagador'] || parsed.pagador || '',
      tipo: parsed['Tipo'] || parsed.tipo || '',
      valor: parsed['Valor'] || parsed.valor || '',
      vencimento: parsed['Vencimento'] || parsed.vencimento || '',
      codigoBarras: parsed['Codigo de Barras'] || parsed.codigoBarras || parsed.codigoDeBarras || '',
    };

    const keys = Object.keys(fields) as Array<keyof Fields>;
    const filled = keys.filter((k) => fields[k]).length;
    const confidence =
      typeof parsed['Confianca'] === 'number'
        ? parsed['Confianca']
        : typeof parsed.confidence === 'number'
          ? parsed.confidence
          : (filled / keys.length) * 100;

    res.status(200).json({ fields, confidence });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
