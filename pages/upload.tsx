import type { NextPage } from 'next';
import { useRef, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Upload.module.css';

const Upload: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Formato de arquivo inválido. Apenas PNG, JPG ou PDF são permitidos.');
      e.target.value = '';
      return;
    }
    setError('');
    // US004 does not define further processing in this page.
  };

  return (
    <Layout>
      <h2>Enviar Conta</h2>
      <div className={styles.form}>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={handleFileChange}
          ref={inputRef}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={handleButtonClick} className={styles.button}>
          Selecionar Arquivo
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </Layout>
  );
};

export default Upload;
