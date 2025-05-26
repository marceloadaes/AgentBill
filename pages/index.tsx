import type { NextPage } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <Layout>
      <div className={styles.grid}>
        <Link href="/upload" className={styles.card}>
          <h2>Upload Bill &rarr;</h2>
          <p>Send an image or PDF for processing.</p>
        </Link>
        <Link href="/spreadsheet" className={styles.card}>
          <h2>Spreadsheet &rarr;</h2>
          <p>View all your bills in Google Sheets.</p>
        </Link>
        <Link href="/history" className={styles.card}>
          <h2>History &rarr;</h2>
          <p>Check previously processed files.</p>
        </Link>
        <Link href="/settings" className={styles.card}>
          <h2>Settings &rarr;</h2>
          <p>Configure your Google integration.</p>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;
