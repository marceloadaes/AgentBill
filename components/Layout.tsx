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
          <Link href="/">Início</Link>
          <Link href="/upload">Enviar Conta</Link>
          <Link href="/spreadsheet">Planilha</Link>
          <Link href="/history">Histórico</Link>
          <Link href="/settings">Configurações</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <Link href="/privacy">Política de Privacidade</Link> |{' '}
        <Link href="/terms">Termos de Serviço</Link>
      </footer>
    </div>
  );
}
