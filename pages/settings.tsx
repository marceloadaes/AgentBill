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
  const [openAIKey, setOpenAIKey] = useState('');
  const [keyStored, setKeyStored] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setConnected(data.hasGoogleToken);
        setKeyStored(data.hasOpenAIKey);
      });
  }, []);

  useEffect(() => {
    if (router.query.status === 'success') {
      setMessage('Google account connected!');
      setIsError(false);
      setConnected(true);
      setShowRetry(false);
    } else if (router.query.status === 'error') {
      setMessage('Failed to authenticate with Google. Please make sure you granted access and try again.');
      setIsError(true);
      setShowRetry(true);
    } else {
      setShowRetry(false);
    }
  }, [router.query.status]);

  const connect = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setMessage('Google OAuth client ID is not configured. Set the NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.');
      setIsError(true);
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/oauth2callback`,
      response_type: 'token',
      scope:
        'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets',
      include_granted_scopes: 'true',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const disconnect = () => {
    fetch('/api/config?key=google', { method: 'DELETE' }).then(() => {
      setConnected(false);
      setMessage('Google account disconnected.');
      setIsError(false);
    });
  };

  const isValidOpenAIKey = (key: string) => key.startsWith('sk-') && key.length > 40;

  const saveKey = () => {
    if (!isValidOpenAIKey(openAIKey)) {
      setMessage('Invalid OpenAI API key. The key should start with \"sk-\" and can be generated from your OpenAI account page.');
      setIsError(true);
      return;
    }
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openaiKey: openAIKey }),
    }).then(() => {
      setKeyStored(true);
      setOpenAIKey('');
      setMessage('OpenAI API key saved!');
      setIsError(false);
    });
  };

  const deleteKey = () => {
    fetch('/api/config?key=openai', { method: 'DELETE' }).then(() => {
      setKeyStored(false);
      setMessage('OpenAI API key removed.');
      setIsError(false);
    });
  };

  return (
    <Layout>
      <h2>Settings</h2>
      {message && (
        <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}
          {showRetry && (
            <button onClick={connect} className={styles.button} style={{ marginLeft: '0.5rem' }}>
              Retry
            </button>
          )}
        </div>
      )}
      <div className={styles.sections}>
        <div className={`${styles.section} ${styles.openAISection}`}>
          <h3 className={styles.sectionTitle}>OpenAI Settings</h3>
          <label htmlFor="openaiKey">OpenAI API Key:</label>
          <input
            id="openaiKey"
            type="text"
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
            className={styles.input}
          />
          <button onClick={saveKey} className={styles.button}>
            Save Key
          </button>
          {keyStored && (
            <>
              <span className={styles.note}>Key stored securely</span>
              <button onClick={deleteKey} className={styles.button}>
                Remove Key
              </button>
            </>
          )}
        </div>
        <div className={`${styles.section} ${styles.googleSection}`}>
          <h3 className={styles.sectionTitle}>Google Settings</h3>
          {connected ? (
            <button onClick={disconnect} className={styles.button}>
              Disconnect Google
            </button>
          ) : (
            <button onClick={connect} className={styles.button}>
              Connect Google
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
