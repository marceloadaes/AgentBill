import type { NextApiRequest, NextApiResponse } from 'next';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || '';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<TokenResponse>;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json() as Promise<TokenResponse>;
}

export async function getValidAccessToken(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<string | null> {
  let token = req.cookies.googleToken;
  const refreshToken = req.cookies.googleRefreshToken;
  const expires = req.cookies.googleTokenExpires;

  if (!token) return null;

  const expiry = expires ? parseInt(expires, 10) : 0;
  if (Date.now() >= expiry - 60000) {
    if (!refreshToken) return null;
    try {
      const data = await refreshAccessToken(refreshToken);
      token = data.access_token;
      const cookies: string[] = [
        `googleToken=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
        `googleTokenExpires=${Date.now() + data.expires_in * 1000}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      ];
      if (data.refresh_token) {
        cookies.push(`googleRefreshToken=${data.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`);
      }
      res.setHeader('Set-Cookie', cookies);
    } catch (err) {
      console.error('Failed to refresh Google token', err);
      return null;
    }
  }

  return token;
}
