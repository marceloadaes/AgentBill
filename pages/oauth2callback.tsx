import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      if (token) {
        fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleToken: token }),
        })
          .then(() => router.replace('/settings?status=success'))
          .catch(() => router.replace('/settings?status=error'));
      } else {
        router.replace('/settings?status=error');
      }
    }
  }, [router]);

  return (
    <Layout>
      <p>Processing authentication...</p>
    </Layout>
  );
}
