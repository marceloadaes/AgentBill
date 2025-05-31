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
  let targetSheet = '';
  let targetSheetId: number | undefined;

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
        const firstSheet = metaData.sheets?.[0];
        targetSheet = firstSheet?.properties?.title || 'Sheet1';
        targetSheetId = firstSheet?.properties?.sheetId;
        const headerRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
            targetSheet,
          )}!A3:F3?valueInputOption=RAW`,
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
      const firstSheet = metaData.sheets?.[0];
      targetSheet = firstSheet?.properties?.title || 'Sheet1';
      targetSheetId = firstSheet?.properties?.sheetId;

      const headerRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
          targetSheet,
        )}!A3:F3?valueInputOption=RAW`,
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

      if (targetSheetId) {
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
                      sheetId: targetSheetId,
                      rowIndex: 0,
                      columnIndex: 0,
                    },
                    fields: 'userEnteredValue,userEnteredFormat.textFormat',
                  },
                },
                {
                  repeatCell: {
                    range: {
                      sheetId: targetSheetId,
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

    // check for existing row with same Valor and Vencimento
    let isFirstBill = false;
    try {
      const listRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
          targetSheet,
        )}!A4:F`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const rows: any[] = listData.values || [];
        isFirstBill = rows.length === 0;
        const duplicate = rows.some(
          (r) => r[3] === fields.valor && r[4] === fields.vencimento,
        );
        if (duplicate) {
          res
            .status(409)
            .json({ error: 'Conta já existe na planilha' });
          return;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: message });
      return;
    }

    // append new row
    const appendRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(
        targetSheet,
      )}!A4:F4:append?valueInputOption=USER_ENTERED`,
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

    if (isFirstBill && targetSheetId) {
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
                repeatCell: {
                  range: {
                    sheetId: targetSheetId,
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
