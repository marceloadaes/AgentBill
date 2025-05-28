import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Links.module.css';

const Links: NextPage = () => {
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('Agent Bill - Controle de Contas');

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.sheetId) setSheetId(data.sheetId);
        if (data.sheetName) setSheetName(data.sheetName);
      });
  }, []);

  return (
    <Layout>
      <h2>Links externos</h2>
      {sheetId ? (
        <p>
          A planilha a seguir contém todas as contas que você enviou:{' '}
          <button
            onClick={() =>
              window.open(
                `https://docs.google.com/spreadsheets/d/${sheetId}`,
                '_blank',
                'noopener,noreferrer'
              )
            }
            className={styles.button}
          >
            {sheetName}
          </button>
          .
        </p>
      ) : (
        <p>Planilha ainda não criada. Envie uma conta para gerar a planilha.</p>
      )}
      <p>
        Consulte seu calendário no{' '}
        <button
          onClick={() =>
            window.open(
              'https://calendar.google.com',
              '_blank',
              'noopener,noreferrer'
            )
          }
          className={styles.button}
        >
          Google Calendar
        </button>{' '}
        para acompanhar seus lembretes.
      </p>
    </Layout>
  );
};

export default Links;
