import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const token = req.cookies.googleToken;
  const { sheetId, sheetName } = req.body;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated with Google' });
    return;
  }
  if (!sheetId || !sheetName) {
    res.status(400).json({ error: 'Missing sheetId or sheetName' });
    return;
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              updateSpreadsheetProperties: {
                properties: { title: sheetName },
                fields: 'title',
              },
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      res.status(500).json({ error: `Failed to rename spreadsheet: ${text}` });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
