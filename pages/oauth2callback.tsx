import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        fetch('/api/googleAuth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
          .then(async (r) => {
            if (r.ok) return r.json();
            const err = await r.json().catch(() => ({}));
            return Promise.reject(err.error || 'Erro desconhecido');
          })
          .then(() => {
            window.dispatchEvent(new Event('config-changed'));
            router.replace('/settings?status=success');
          })
          .catch((e) => {
            const msg = encodeURIComponent(String(e));
            router.replace(`/settings?status=error&message=${msg}`);
          });
      } else {
        router.replace('/settings?status=error');
      }
    }
  }, [router]);

  return (
    <Layout>
      <p>Processando autenticação...</p>
    </Layout>
  );
}
