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
      <h3>Visualização da Planilha de Contas</h3>
      {sheetId ? (
        <>
          <iframe
            src={`https://docs.google.com/spreadsheets/d/${sheetId}/preview`}
            className={styles.iframe}
            title="Planilha"
          />
          <p>
            Abrir a planilha no Google Sheets{' '}
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
        </>
      ) : (
        <p>A planilha será criada quando a primeira conta for escaneada.</p>
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
