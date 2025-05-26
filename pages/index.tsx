import type { NextPage } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <Layout>
      <div className={styles.logoContainer}>
        {/* Display project logo */}
        <img src="/AgentBillLogo.png" alt="Agent Bill logo" className={styles.logo} />
      </div>
      <div className={styles.grid}>
        <Link href="/upload" className={styles.card}>
          <h2>Enviar Conta &rarr;</h2>
          <p>Envie uma imagem ou PDF para processamento.</p>
        </Link>
        <Link href="/spreadsheet" className={styles.card}>
          <h2>Planilha &rarr;</h2>
          <p>Veja todas as suas contas no Google Sheets.</p>
        </Link>
        <Link href="/history" className={styles.card}>
          <h2>Histórico &rarr;</h2>
          <p>Veja arquivos processados anteriormente.</p>
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
