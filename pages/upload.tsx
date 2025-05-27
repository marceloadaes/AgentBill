import type { NextPage } from 'next';
import { useRef, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Upload.module.css';

const Upload: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<{
    fields: {
      nomeConta: string;
      cedente: string;
      tipo: string;
      valor: string;
      vencimento: string;
      codigoBarras: string;
    };
    confidence: number;
  } | null>(null);

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
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) return;
      try {
        const res = await fetch('/api/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64, type: file.type }),
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
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
      {result && (
        <div className={styles.result}>
          <h3>Dados Extraídos</h3>
          <table className={styles.resultTable}>
            <tbody>
              <tr>
                <th>Nome da conta</th>
                <td>{result.fields.nomeConta || '-'}</td>
              </tr>
              <tr>
                <th>Cedente</th>
                <td>{result.fields.cedente || '-'}</td>
              </tr>
              <tr>
                <th>Tipo</th>
                <td>{result.fields.tipo || '-'}</td>
              </tr>
              <tr>
                <th>Valor</th>
                <td>{result.fields.valor || '-'}</td>
              </tr>
              <tr>
                <th>Vencimento</th>
                <td>{result.fields.vencimento || '-'}</td>
              </tr>
              <tr>
                <th>Código de barras</th>
                <td>{result.fields.codigoBarras || '-'}</td>
              </tr>
              <tr>
                <th>Confiança</th>
                <td>{(result.confidence * 100).toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Upload;
