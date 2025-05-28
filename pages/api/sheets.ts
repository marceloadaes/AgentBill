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
  let createdNewSheet = false;

  try {
    if (sheetId) {
      // first check if the spreadsheet was moved to the trash
      let trashed = false;
      const driveRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${sheetId}?fields=trashed`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (driveRes.status === 404 || driveRes.status === 410) {
        trashed = true;
      } else if (driveRes.ok) {
        const driveData = await driveRes.json();
        trashed = Boolean(driveData.trashed);
      }

      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (checkRes.status === 404 || checkRes.status === 410 || trashed) {
        console.warn(
          `Spreadsheet ${sheetId} not found or trashed (status ${checkRes.status}). Creating a new one.`,
        );
        sheetId = undefined;
      } else if (checkRes.ok) {
        const metaData = await checkRes.json();
        const contasSheet = metaData.sheets?.find(
          (s: any) => s.properties?.title === 'Contas',
        );
        const defaultNamedSheets = metaData.sheets
          ?.filter((s: any) =>
            ['Sheet1', 'Página1'].includes(s.properties?.title as string),
          )
          .map((s: any) => s.properties?.sheetId)
          .filter(Boolean);
        const requests = [] as any[];
        if (!contasSheet) {
          requests.push({ addSheet: { properties: { title: 'Contas' } } });
        }
        for (const id of defaultNamedSheets || []) {
          requests.push({ deleteSheet: { sheetId: id } });
        }
        if (requests.length > 0) {
          const batchRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ requests }),
            },
          );
          if (!batchRes.ok) {
            const text = await batchRes.text();
            res.status(500).json({ error: `Failed to setup sheet: ${text}` });
            return;
          }
        }

        if (!contasSheet) {
          const headerRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Contas!A3:F3?valueInputOption=RAW`,
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
      }
    }

    if (!sheetId) {
      // create spreadsheet
      createdNewSheet = true;
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
      console.info(`Created new spreadsheet with id ${sheetId}`);
      // store sheetId cookie
      res.setHeader(
        'Set-Cookie',
        `sheetId=${sheetId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      );

      // fetch default sheet metadata
      const metaRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!metaRes.ok) {
        const text = await metaRes.text();
        res.status(500).json({ error: `Failed to get sheet metadata: ${text}` });
        return;
      }
      const metaData = await metaRes.json();
      const defaultNamedSheets = metaData.sheets
        ?.filter((s: any) =>
          ['Sheet1', 'Página1'].includes(s.properties?.title as string),
        )
        .map((s: any) => s.properties?.sheetId)
        .filter(Boolean);

      // add "Contas" sheet and remove default-named sheets
      const batchRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              { addSheet: { properties: { title: 'Contas' } } },
              ...defaultNamedSheets.map((id: number) => ({ deleteSheet: { sheetId: id } })),
            ],
          }),
        },
      );
      if (!batchRes.ok) {
        const text = await batchRes.text();
        res.status(500).json({ error: `Failed to setup sheets: ${text}` });
        return;
      }

      // write header row on "Contas"
      const headerRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Contas!A3:F3?valueInputOption=RAW`,
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

      // fetch sheet id for "Contas" to apply formatting and logo
      const metaRes2 = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (metaRes2.ok) {
        const data = await metaRes2.json();
        const contasSheet = data.sheets?.find(
          (s: any) => s.properties?.title === 'Contas',
        );
        const contasSheetId = contasSheet?.properties?.sheetId;
        if (contasSheetId) {
          await fetch(
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
                    updateCells: {
                      rows: [
                        {
                          values: [
                            {
                              userEnteredValue: { stringValue: 'Agent Bill' },
                              userEnteredFormat: {
                                textFormat: { fontSize: 40, bold: true },
                              },
                            },
                          ],
                        },
                      ],
                      start: {
                        sheetId: contasSheetId,
                        rowIndex: 0,
                        columnIndex: 0,
                      },
                      fields: 'userEnteredValue,userEnteredFormat.textFormat',
                    },
                  },
                  {
                    repeatCell: {
                      range: {
                        sheetId: contasSheetId,
                        startRowIndex: 2,
                        endRowIndex: 3,
                        startColumnIndex: 0,
                        endColumnIndex: 6,
                      },
                      cell: {
                        userEnteredFormat: {
                          backgroundColor: {
                            red: 44 / 255,
                            green: 62 / 255,
                            blue: 80 / 255,
                          },
                          textFormat: {
                            foregroundColor: { red: 1, green: 1, blue: 1 },
                            bold: true,
                          },
                        },
                      },
                      fields: 'userEnteredFormat(backgroundColor,textFormat)',
                    },
                  },
                ],
              }),
            },
          );
        }
      }
    }

    // append new row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Contas!A4:F4:append?valueInputOption=USER_ENTERED`,
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
    res
      .status(200)
      .json({
        updatedRange: appendData.updates?.updatedRange,
        sheetId,
        createdNewSheet,
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
