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
  const [userEmail, setUserEmail] = useState('');
  const [userIcon, setUserIcon] = useState('');
  const [userName, setUserName] = useState('');
  const [sheetName, setSheetName] = useState('Agent Bill - Controle de Contas');
  const [sheetId, setSheetId] = useState('');

  useEffect(() => {
    const init = async () => {
      const configRes = await fetch('/api/config');
      const configData = await configRes.json();
      setConnected(configData.hasGoogleToken);
      setKeyStored(configData.hasOpenAIKey);
      if (configData.sheetName) setSheetName(configData.sheetName);
      if (configData.sheetId) setSheetId(configData.sheetId);

      if (configData.hasGoogleToken) {
        try {
          const userRes = await fetch('/api/userinfo');
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.email && userData.picture && userData.name) {
              setUserEmail(userData.email);
              setUserIcon(userData.picture);
              setUserName(userData.name);
            }
          }
        } catch {
          setUserEmail('');
          setUserIcon('');
          setUserName('');
        }
      } else {
        setUserEmail('');
        setUserIcon('');
        setUserName('');
      }
    };

    init();
  }, []);


  useEffect(() => {
    if (router.query.status === 'success') {
      setMessage('Conta do Google conectada!');
      setIsError(false);
      setShowRetry(false);
    } else if (router.query.status === 'error') {
      const errMsg =
        typeof router.query.message === 'string' && router.query.message
          ? router.query.message
          : 'Falha ao autenticar com o Google. Certifique-se de conceder acesso e tente novamente.';
      setMessage(errMsg);
      setIsError(true);
      setShowRetry(true);
    } else {
      setShowRetry(false);
    }
  }, [router.query.status, router.query.message]);


  // Hard-coded default Google OAuth client ID so the app works without config
  const GOOGLE_CLIENT_ID =
    '198927534674-0akhqu4ip9hg276ag2mliknkh7pvp4op.apps.googleusercontent.com';

  const connect = () => {
    const clientId = GOOGLE_CLIENT_ID;
    if (!clientId) {
      setMessage('ID de cliente do Google OAuth não configurado.');
      setIsError(true);
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/oauth2callback`,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope:
        'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      include_granted_scopes: 'true',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const disconnect = () => {
    fetch('/api/config?key=google', { method: 'DELETE' }).then(() => {
      setConnected(false);
      setMessage('Conta do Google desconectada.');
      setIsError(false);
      window.dispatchEvent(new Event('config-changed'));
    });
  };

  const isValidOpenAIKey = (key: string) => key.startsWith('sk-') && key.length > 40;

  const saveKey = () => {
    if (!isValidOpenAIKey(openAIKey)) {
      setMessage('Chave da API do OpenAI inválida. Ela deve começar com "sk-" e pode ser gerada na página da sua conta OpenAI.');
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
      setMessage('Chave da API do OpenAI salva!');
      setIsError(false);
      window.dispatchEvent(new Event('config-changed'));
    });
  };

  const deleteKey = () => {
    fetch('/api/config?key=openai', { method: 'DELETE' }).then(() => {
      setKeyStored(false);
      setMessage('Chave da API do OpenAI removida.');
      setIsError(false);
      window.dispatchEvent(new Event('config-changed'));
    });
  };

  const saveSheet = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheetName }),
    });

    if (sheetId) {
      const res = await fetch('/api/renameSheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, sheetName }),
      });
      if (!res.ok) {
        setMessage('Falha ao renomear planilha.');
        setIsError(true);
        return;
      }
    }

    setMessage('Nome da planilha salvo!');
    setIsError(false);
  };

  return (
    <Layout>
      <h2>Configurações</h2>
      {keyStored && (
        <div className={`${styles.message} ${styles.success}`}>Chave configurada e armazenada!</div>
      )}
      {message && (
        <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>{message}
          {showRetry && (
            <button onClick={connect} className={styles.button} style={{ marginLeft: '0.5rem' }}>
              Tentar novamente
            </button>
          )}
        </div>
      )}
      <div className={styles.sections}>
        <div className={`${styles.section} ${styles.googleSection}`}>
          <h3 className={styles.sectionTitle}>Conexão Conta Google</h3>
          <div className={styles.status}>
            {connected ? (
              userEmail ? (
                <>
                  {userIcon && (
                    <img src={userIcon} alt="account" className={styles.profileIcon} />
                  )}
                  <span>{userName} ({userEmail})</span>
                </>
              ) : (
                <span className={styles.notConnected}>Informações indisponíveis</span>
              )
            ) : (
              <>
                <span className={styles.notConnected}>X</span>
                <span className={styles.notConnected}>Não conectado</span>
              </>
            )}
          </div>
          {connected ? (
            <button onClick={disconnect} className={styles.button}>
              Desconectar Google
            </button>
          ) : (
            <button onClick={connect} className={styles.button}>
              Conectar Google
            </button>
          )}
        </div>
        <div className={`${styles.section} ${styles.sheetSection}`}>
          <h3 className={styles.sectionTitle}>Nome da Planilha Google Sheet</h3>
          <label htmlFor="sheetName">Nome da Planilha Google Sheet:</label>
          <input
            id="sheetName"
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            className={styles.input}
          />
          <button onClick={saveSheet} className={styles.button}>
            Salvar nome
          </button>
        </div>
        <div className={`${styles.section} ${styles.openAISection}`}>
          <h3 className={styles.sectionTitle}>Configurações do OpenAI</h3>
          {keyStored ? (
            <>
              <button onClick={deleteKey} className={styles.button}>
                Remover chave
              </button>
            </>
          ) : (
            <>
              <p className={styles.instructions}>
                Para obter sua chave:
                <ol>
                  <li>Acesse platform.openai.com e faça login</li>
                  <li>Abra a página "API Keys"</li>
                  <li>Crie uma nova chave secreta</li>
                  <li>Copie o valor e cole abaixo</li>
                </ol>
              </p>
              <label htmlFor="openaiKey">Chave da API do OpenAI:</label>
              <input
                id="openaiKey"
                type="text"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                className={styles.input}
              />
              <button onClick={saveKey} className={styles.button}>
                Salvar chave
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
