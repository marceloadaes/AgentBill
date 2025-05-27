import type { NextPage } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <Layout>
      <div className={styles.grid}>
        <Link href="/upload" className={styles.card}>
          <h2>Enviar Conta &rarr;</h2>
          <p>Envie uma imagem ou PDF para processamento.</p>
        </Link>
        <Link href="/links" className={styles.card}>
          <h2>Links externos &rarr;</h2>
          <p>Acesse a planilha e seu calendário.</p>
        </Link>
        <Link href="/settings" className={styles.card}>
          <h2>Configurações &rarr;</h2>
          <p>Configure sua integração com o Google.</p>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;
