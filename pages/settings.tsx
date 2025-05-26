import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Settings.module.css';

const Settings: NextPage = () => {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('googleToken');
    setConnected(!!token);
  }, []);

  useEffect(() => {
    if (router.query.status === 'success') {
      setMessage('Google account connected!');
      setIsError(false);
      setConnected(true);
    } else if (router.query.status === 'error') {
      setMessage('Failed to authenticate with Google.');
      setIsError(true);
    }
  }, [router.query.status]);

  const connect = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/oauth2callback`,
      response_type: 'token',
      scope:
        'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets',
      include_granted_scopes: 'true',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const disconnect = () => {
    localStorage.removeItem('googleToken');
    setConnected(false);
    setMessage('Google account disconnected.');
    setIsError(false);
  };

  return (
    <Layout>
      <h2>Settings</h2>
      {message && (
        <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}</div>
      )}
      {connected ? (
        <button onClick={disconnect} className={styles.button}>
          Disconnect Google
        </button>
      ) : (
        <button onClick={connect} className={styles.button}>
          Connect Google
        </button>
      )}
    </Layout>
  );
};

export default Settings;
