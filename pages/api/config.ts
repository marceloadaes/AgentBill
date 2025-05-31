import type { NextApiRequest, NextApiResponse } from 'next';
import { getValidAccessToken } from '../../utils/googleAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const hasGoogleToken = Boolean(req.cookies.googleToken);
    const hasOpenAIKey = Boolean(req.cookies.openaiKey);
    const sheetName =
      req.cookies.sheetName || 'Agent Bill - Controle de Contas';
    let sheetId = req.cookies.sheetId || '';

    // Validate sheetId in case the spreadsheet was deleted or moved to trash
    if (sheetId && hasGoogleToken) {
      try {
        const token = await getValidAccessToken(req, res);
        if (!token) {
          throw new Error('No token');
        }
        const driveRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${sheetId}?fields=trashed`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (driveRes.status === 404 || driveRes.status === 410) {
          sheetId = '';
        } else if (driveRes.ok) {
          const data = await driveRes.json();
          if (data.trashed) {
            sheetId = '';
          }
        }
      } catch (err) {
        sheetId = '';
      }

      if (!sheetId) {
        res.setHeader(
          'Set-Cookie',
          'sheetId=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
        );
      }
    }

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
    if (req.body.googleRefreshToken) {
      cookies.push(`googleRefreshToken=${req.body.googleRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    if (req.body.googleTokenExpires) {
      cookies.push(`googleTokenExpires=${req.body.googleTokenExpires}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
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
      cookies.push('googleRefreshToken=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
      cookies.push('googleTokenExpires=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
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
