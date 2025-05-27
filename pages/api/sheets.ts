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

  const fields = req.body as Fields;
  const sheetName = req.cookies.sheetName || 'Agent Bill - Controle de Contas';
  let sheetId = req.cookies.sheetId;

  try {
    if (!sheetId) {
      // create spreadsheet
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: { title: sheetName } }),
      });
      if (!createRes.ok) {
        const text = await createRes.text();
        res.status(500).json({ error: `Failed to create spreadsheet: ${text}` });
        return;
      }
      const createData = await createRes.json();
      sheetId = createData.spreadsheetId;
      // store sheetId cookie
      res.setHeader('Set-Cookie', `sheetId=${sheetId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);

      // write header row
      const headerRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:F1?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [
              [
                'Empresa Recebedora',
                'Pagador',
                'Tipo',
                'Valor',
                'Vencimento',
                'Código de Barras',
              ],
            ],
          }),
        },
      );
      if (!headerRes.ok) {
        const text = await headerRes.text();
        res.status(500).json({ error: `Failed to write headers: ${text}` });
        return;
      }
    }

    // append new row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:F:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [[
            fields.empresaRecebedora,
            fields.pagador,
            fields.tipo,
            fields.valor,
            fields.vencimento,
            fields.codigoBarras,
          ]],
        }),
      },
    );

    if (!appendRes.ok) {
      const text = await appendRes.text();
      res.status(500).json({ error: `Failed to append row: ${text}` });
      return;
    }

    const appendData = await appendRes.json();
    res.status(200).json({ updatedRange: appendData.updates?.updatedRange, sheetId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
