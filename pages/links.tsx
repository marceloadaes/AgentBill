import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

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
          <a
            href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {sheetName}
          </a>
          .
        </p>
      ) : (
        <p>Planilha ainda não criada. Envie uma conta para gerar a planilha.</p>
      )}
      <p>
        Consulte seu calendário no{' '}
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Calendar
        </a>{' '}
        para acompanhar seus lembretes.
      </p>
    </Layout>
  );
};

export default Links;
