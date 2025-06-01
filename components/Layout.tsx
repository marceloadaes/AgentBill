import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  const [configured, setConfigured] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchConfig = () => {
      fetch('/api/config')
        .then((res) => res.json())
        .then((data) =>
          setConfigured(data.hasGoogleToken && data.hasOpenAIKey)
        )
        .catch(() => setConfigured(false));
    };

    fetchConfig();

    const handler = () => fetchConfig();
    window.addEventListener('config-changed', handler);
    return () => {
      window.removeEventListener('config-changed', handler);
    };
  }, []);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const pages = ['/', '/upload', '/links', '/settings'];

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        const currentIndex = pages.indexOf(router.pathname);
        if (currentIndex !== -1) {
          if (diffX < 0 && currentIndex < pages.length - 1) {
            router.push(pages[currentIndex + 1]);
          } else if (diffX > 0 && currentIndex > 0) {
            router.push(pages[currentIndex - 1]);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router.pathname]);

  const renderLink = (
    href: string,
    label: string,
    disable: boolean
  ) => {
    if (disable) {
      return <span className={styles.disabled}>{label}</span>;
    }

    const linkClass =
      router.pathname === href
        ? `${styles.navLink} ${styles.active}`
        : styles.navLink;

    return (
      <Link href={href} className={linkClass}>
        {label}
      </Link>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          {renderLink('/', 'Início', !configured)}
          {renderLink('/upload', 'Enviar Conta', !configured)}
          {renderLink('/links', 'Planilha', !configured)}
          <Link
            href="/settings"
            className={
              router.pathname === '/settings'
                ? `${styles.navLink} ${styles.active}`
                : styles.navLink
            }
          >
            Configurações
          </Link>
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
