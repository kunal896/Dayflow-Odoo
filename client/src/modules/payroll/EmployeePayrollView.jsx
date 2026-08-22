import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Row({ label, value, bold }) {
  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: 8, fontWeight: bold ? 700 : 400 }}>{label}</td>
      <td style={{ padding: 8, textAlign: 'right', fontWeight: bold ? 700 : 400 }}>{Number(value).toFixed(2)}</td>
    </tr>
  );
}

export default function EmployeePayrollView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/payroll/me');
        setRecords(data.data);
        if (data.data.length > 0) setSelected(`${data.data[0].year}-${data.data[0].month}`);
      } catch {
        // error toast already shown by the shared axios interceptor
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const options = useMemo(
    () => records.map((r) => ({ key: `${r.year}-${r.month}`, label: `${MONTH_NAMES[r.month - 1]} ${r.year}` })),
    [records]
  );
  const record = records.find((r) => `${r.year}-${r.month}` === selected);

  return (
    <section>
      <h1>Payroll</h1>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No payroll records yet.</p>
      ) : (
        <div style={{ maxWidth: 420 }}>
          <label>
            Month
            <select
              value={selected || ''}
              onChange={(e) => setSelected(e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 20 }}
            >
              {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </label>
          {record && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <Row label="Base salary" value={record.baseSalary} />
                <Row label="Allowances" value={record.allowances} />
                <Row label="Deductions" value={record.deductions} />
                <Row label="Net salary" value={record.netSalary} bold />
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
}
