import type { NextPage } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) =>
        setConfigured(data.hasGoogleToken && data.hasOpenAIKey)
      )
      .catch(() => setConfigured(false));
  }, []);

  return (
    <Layout>
      <div className={styles.grid}>
        {configured ? (
          <Link href="/upload" className={styles.card}>
            <h2>Enviar Conta &rarr;</h2>
            <p>Envie uma imagem ou PDF para processamento.</p>
          </Link>
        ) : (
          <span className={`${styles.card} ${styles.disabled}`}>
            <h2>Enviar Conta &rarr;</h2>
            <p>Envie uma imagem ou PDF para processamento.</p>
          </span>
        )}
        {configured ? (
          <Link href="/links" className={styles.card}>
            <h2>Planilha &rarr;</h2>
            <p>Acesse a planilha e seu calendário.</p>
          </Link>
        ) : (
          <span className={`${styles.card} ${styles.disabled}`}>
            <h2>Planilha &rarr;</h2>
            <p>Acesse a planilha e seu calendário.</p>
          </span>
        )}
        <Link href="/settings" className={styles.card}>
          <h2>Configurações &rarr;</h2>
          <p>Configure sua integração com o Google.</p>
        </Link>
      </div>
      {!configured && (
        <p className={styles.message}>
          Para começar, acesse as Configurações e conecte sua conta Google e a
          chave da API.
        </p>
      )}
    </Layout>
  );
};

export default Home;
