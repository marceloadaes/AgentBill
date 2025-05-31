import type { NextApiRequest, NextApiResponse } from 'next';
import { exchangeCode } from '../../utils/googleAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { code, redirect_uri } = req.body as {
    code?: string;
    redirect_uri?: string;
  };
  if (!code) {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  try {
    const data = await exchangeCode(code, redirect_uri);
    const cookies: string[] = [];
    if (data.access_token) {
      cookies.push(
        `googleToken=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      );
    }
    if (data.refresh_token) {
      cookies.push(
        `googleRefreshToken=${data.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      );
    }
    if (data.expires_in) {
      cookies.push(
        `googleTokenExpires=${Date.now() + data.expires_in * 1000}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      );
    }
    if (cookies.length) {
      res.setHeader('Set-Cookie', cookies);
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
