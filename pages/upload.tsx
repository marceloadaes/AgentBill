import type { NextPage } from 'next';
import { useRef, useState, useEffect } from 'react';
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
  const [sheetStatus, setSheetStatus] = useState('');
  const [calendarStatus, setCalendarStatus] = useState('');
  const [eventDateTime, setEventDateTime] = useState('');
  const [alarm, setAlarm] = useState(false);
  const [result, setResult] = useState<{
    fields: {
      empresaRecebedora: string;
      pagador: string;
      tipo: string;
      valor: string;
      vencimento: string;
      codigoBarras: string;
    };
    confidence: number;
  } | null>(null);

  const [fields, setFields] = useState({
    empresaRecebedora: '',
    pagador: '',
    tipo: '',
    valor: '',
    vencimento: '',
    codigoBarras: '',
  });

  useEffect(() => {
    if (result) {
      setFields(result.fields);
      setEventDateTime(`${formatDate(result.fields.vencimento)}T10:00`);
      setAlarm(false);
      setCalendarStatus('');
    }
  }, [result]);

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

  const sendToSheet = async () => {
    if (!result) return;
    setSheetStatus('Enviando para a planilha...');
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const data = await res.json();
        let message = 'Conta adicionada à planilha!';
        if (data.createdNewSheet) {
          message += ' Nova planilha criada.';
        }
        setSheetStatus(message);
      } else {
        const text = await res.text();
        let msg = text;
        try {
          msg = JSON.parse(text).error || text;
        } catch {
          // ignore
        }
        setSheetStatus(`Erro ao adicionar: ${msg}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSheetStatus(`Erro ao adicionar: ${msg}`);
    }
  };

  const sendToCalendar = async () => {
    if (!result) return;
    if (!eventDateTime) {
      setCalendarStatus('Data inválida.');
      return;
    }
    setCalendarStatus('Enviando para o calendário...');
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields,
          dateTime: eventDateTime,
          alarm,
        }),
      });
      if (res.ok) {
        setCalendarStatus('Evento criado no calendário!');
      } else {
        const text = await res.text();
        let msg = text;
        try {
          msg = JSON.parse(text).error || text;
        } catch {
          // ignore
        }
        setCalendarStatus(`Erro ao criar evento: ${msg}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCalendarStatus(`Erro ao criar evento: ${msg}`);
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
                <th>Empresa Recebedora</th>
                <td>
                  <input
                    type="text"
                    value={fields.empresaRecebedora}
                    onChange={(e) =>
                      setFields({ ...fields, empresaRecebedora: e.target.value })
                    }
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <th>Pagador</th>
                <td>
                  <input
                    type="text"
                    value={fields.pagador}
                    onChange={(e) =>
                      setFields({ ...fields, pagador: e.target.value })
                    }
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <th>Tipo</th>
                <td>
                  <input
                    type="text"
                    value={fields.tipo}
                    onChange={(e) => setFields({ ...fields, tipo: e.target.value })}
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <th>Valor</th>
                <td>
                  <input
                    type="text"
                    value={fields.valor}
                    onChange={(e) => setFields({ ...fields, valor: e.target.value })}
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <th>Vencimento</th>
                <td>
                  <input
                    type="text"
                    value={fields.vencimento}
                    onChange={(e) =>
                      setFields({ ...fields, vencimento: e.target.value })
                    }
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <th>Código de barras</th>
                <td>
                  <input
                    type="text"
                    value={fields.codigoBarras}
                    onChange={(e) =>
                      setFields({ ...fields, codigoBarras: e.target.value })
                    }
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <th>Confiança</th>
                <td>{result.confidence.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={sendToSheet}>
              Adicione à planilha
            </button>
            {sheetStatus && <div className={styles.status}>{sheetStatus}</div>}
            <button
              type="button"
              className={styles.button}
              onClick={sendToCalendar}
            >
              Adicione ao seu calendario
            </button>
            {calendarStatus && (
              <div className={styles.status}>{calendarStatus}</div>
            )}
            <div className={styles.calendarFields}>
              <input
                type="datetime-local"
                value={eventDateTime}
                onChange={(e) => setEventDateTime(e.target.value)}
                className={styles.input}
              />
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={alarm}
                  onChange={(e) => setAlarm(e.target.checked)}
                />{' '}
                Criar Alarme?
              </label>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Upload;
