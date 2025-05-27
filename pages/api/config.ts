import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const hasGoogleToken = Boolean(req.cookies.googleToken);
    const hasOpenAIKey = Boolean(req.cookies.openaiKey);
    const sheetName =
      req.cookies.sheetName || 'Agent Bill - Controle de Contas';
    const sheetId = req.cookies.sheetId || '';
    res.status(200).json({
      hasGoogleToken,
      hasOpenAIKey,
      sheetName,
      sheetId,
    });
    return;
  }

  if (req.method === 'POST') {
    const cookies: string[] = [];
    if (req.body.googleToken) {
      cookies.push(`googleToken=${req.body.googleToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    if (req.body.openaiKey) {
      cookies.push(`openaiKey=${req.body.openaiKey}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    if (req.body.sheetName) {
      cookies.push(`sheetName=${encodeURIComponent(req.body.sheetName)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    if (req.body.sheetId) {
      cookies.push(`sheetId=${req.body.sheetId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    if (cookies.length) {
      res.setHeader('Set-Cookie', cookies);
    }
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    const cookies: string[] = [];
    if (req.query.key === 'google' || !req.query.key) {
      cookies.push('googleToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
    }
    if (req.query.key === 'openai' || !req.query.key) {
      cookies.push('openaiKey=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
    }
    if (req.query.key === 'sheet' || !req.query.key) {
      cookies.push('sheetId=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
    }
    if (req.query.key === 'sheetName') {
      cookies.push('sheetName=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
    }
    if (cookies.length) {
      res.setHeader('Set-Cookie', cookies);
    }
    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).end();
}
