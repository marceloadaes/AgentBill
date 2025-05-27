import type { NextPage } from 'next';
import { useRef, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Upload.module.css';

const Upload: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

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
    setStatus('Processando arquivo...');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) return;
      try {
        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64, type: file.type, name: file.name }),
        });
        if (res.ok) {
          setStatus('Processamento concluído!');
        } else {
          setStatus('Falha ao processar o arquivo.');
        }
      } catch {
        setStatus('Falha ao processar o arquivo.');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <h2>Enviar Conta</h2>
      <p className={styles.instructions}>
        Envie uma imagem legível de uma conta (por exemplo, água, luz,
        telefone ou boleto) nos formatos JPG, PNG ou PDF.
      </p>
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
        {status && <div className={styles.status}>{status}</div>}
      </div>
    </Layout>
  );
};

export default Upload;
