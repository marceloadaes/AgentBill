import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies.googleToken;
  if (!token) {
    res.status(401).json({ error: 'Not connected' });
    return;
  }

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      res.status(500).json({ error: 'Failed to fetch user info' });
      return;
    }
    const data = await response.json();
    res.status(200).json({
      email: data.email,
      picture: data.picture,
      name: data.name,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}
