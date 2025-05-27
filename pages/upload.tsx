import type { NextPage } from 'next';
import { useRef, useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Upload.module.css';
import {
  compressImage,
  fileToDataURL,
  MAX_IMAGE_BYTES,
} from '../utils/image';

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  const match = value.match(/(\d{1,2})\D(\d{1,2})\D(\d{2,4})/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '';
}

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      let dataUrl: string;
      let type = file.type;
      if (file.size > MAX_IMAGE_BYTES) {
        if (file.type === 'image/png' || file.type === 'image/jpeg') {
          dataUrl = await compressImage(file, MAX_IMAGE_BYTES);
          type = 'image/jpeg';
        } else {
          setStatus('');
          setError('Arquivos acima de 1MB não são suportados.');
          return;
        }
      } else {
        dataUrl = await fileToDataURL(file);
      }

      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('Falha ao ler o arquivo');

      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: base64, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setStatus('Processamento concluído!');
      } else {
        const text = await res.text();
        let message = text;
        try {
          const parsed = JSON.parse(text);
          message = parsed.error || text;
        } catch {
          // leave message as text
        }
        setStatus(`Falha ao processar o arquivo: ${message}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus(`Falha ao processar o arquivo: ${msg}`);
    }
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
          <div className={styles.actions}>
            <button type="button" className={styles.button}>
              Adicione à planilha
            </button>
            <button type="button" className={styles.button}>
              Adicione ao seu calendario
            </button>
            <div className={styles.calendarFields}>
              <input
                type="datetime-local"
                defaultValue={`${formatDate(result.fields.vencimento)}T10:00`}
                className={styles.input}
              />
              <label className={styles.checkbox}>
                <input type="checkbox" /> Criar Alarme?
              </label>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Upload;
