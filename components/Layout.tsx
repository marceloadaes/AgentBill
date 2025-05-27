import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import styles from '../styles/Layout.module.css';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) =>
        setConfigured(data.hasGoogleToken && data.hasOpenAIKey)
      )
      .catch(() => setConfigured(false));
  }, []);

  const renderLink = (
    href: string,
    label: string,
    disable: boolean
  ) => {
    return disable ? (
      <span className={styles.disabled}>{label}</span>
    ) : (
      <Link href={href}>{label}</Link>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          {renderLink('/', 'Início', !configured)}
          {renderLink('/upload', 'Enviar Conta', !configured)}
          {renderLink('/links', 'Links externos', !configured)}
          <Link href="/settings">Configurações</Link>
        </nav>
      </header>
      <div className={styles.logoContainer}>
        <img src="/AgentBillLogo.png" alt="Agent Bill logo" className={styles.logo} />
      </div>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <Link href="/privacy">Política de Privacidade</Link> |{' '}
        <Link href="/terms">Termos de Serviço</Link>
      </footer>
    </div>
  );
}
