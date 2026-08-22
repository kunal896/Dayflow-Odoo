import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

function EditForm({ form, setForm, onSave, onCancel, saving }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <input type="number" placeholder="Base" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} style={{ width: 90 }} />
      <input type="number" placeholder="Allowances" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} style={{ width: 100 }} />
      <input type="number" placeholder="Deductions" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} style={{ width: 100 }} />
      <input type="number" placeholder="Month" min={1} max={12} value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} style={{ width: 60 }} />
      <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} style={{ width: 80 }} />
      <button onClick={onSave} disabled={saving} type="button">{saving ? 'Saving...' : 'Save'}</button>
      <button onClick={onCancel} type="button" disabled={saving}>Cancel</button>
    </div>
  );
}

export default function AdminPayrollView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const { data } = await api.get('/payroll/all');
      setRecords(data.data);
    } catch {
      // error toast already shown by the shared axios interceptor
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openEdit(record) {
    setEditingUserId(record.userId);
    setForm({
      baseSalary: record.baseSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      month: record.month,
      year: record.year,
    });
  }

  async function save(userId) {
    if (form.baseSalary === '' || form.month === '' || form.year === '') {
      return toast.error('Base salary, month and year are required');
    }
    setSaving(true);
    try {
      const { data } = await api.put(`/payroll/${userId}`, form);
      setRecords((prev) =>
        prev.map((r) => (r.id === data.data.id ? { ...r, ...data.data } : r))
      );
      toast.success('Payroll updated');
      setEditingUserId(null);
      setForm(null);
    } catch {
      // error toast already shown
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1>Payroll</h1>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No payroll records yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: 8 }}>Employee</th>
              <th style={{ padding: 8 }}>Month</th>
              <th style={{ padding: 8 }}>Base</th>
              <th style={{ padding: 8 }}>Allowances</th>
              <th style={{ padding: 8 }}>Deductions</th>
              <th style={{ padding: 8 }}>Net</th>
              <th style={{ padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{r.User?.name} ({r.User?.employeeId})</td>
                <td style={{ padding: 8 }}>{r.month}/{r.year}</td>
                <td style={{ padding: 8 }}>{Number(r.baseSalary).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{Number(r.allowances).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{Number(r.deductions).toFixed(2)}</td>
                <td style={{ padding: 8, fontWeight: 700 }}>{Number(r.netSalary).toFixed(2)}</td>
                <td style={{ padding: 8 }}>
                  {editingUserId === r.userId ? (
                    <EditForm form={form} setForm={setForm} onSave={() => save(r.userId)} onCancel={() => { setEditingUserId(null); setForm(null); }} saving={saving} />
                  ) : (
                    <button onClick={() => openEdit(r)} type="button">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
