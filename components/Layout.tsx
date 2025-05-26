import Link from 'next/link';
import { ReactNode } from 'react';
import styles from '../styles/Layout.module.css';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Agent Bill</h1>
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/upload">Upload Bill</Link>
          <Link href="/spreadsheet">Spreadsheet</Link>
          <Link href="/history">History</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
