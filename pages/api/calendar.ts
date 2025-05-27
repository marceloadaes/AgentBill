import type { NextApiRequest, NextApiResponse } from 'next';

interface Fields {
  empresaRecebedora: string;
  pagador: string;
  tipo: string;
  valor: string;
  vencimento: string;
  codigoBarras: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const token = req.cookies.googleToken;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated with Google' });
    return;
  }

  const { fields, dateTime, alarm } = req.body as {
    fields: Fields;
    dateTime: string;
    alarm: boolean;
  };

  if (!fields || !dateTime) {
    res.status(400).json({ error: 'Missing data' });
    return;
  }

  try {
    const start = new Date(dateTime);
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid date' });
      return;
    }
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const event = {
      summary: fields.tipo || fields.empresaRecebedora || 'Conta',
      description: `Empresa: ${fields.empresaRecebedora}\nValor: ${fields.valor}\nVencimento: ${fields.vencimento}\nCódigo de barras: ${fields.codigoBarras}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      reminders: {
        useDefault: false,
        overrides: alarm ? [{ method: 'popup', minutes: 24 * 60 }] : [],
      },
    };

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      res.status(500).json({ error: `Failed to create event: ${text}` });
      return;
    }

    const data = await response.json();
    res.status(200).json({ eventId: data.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
