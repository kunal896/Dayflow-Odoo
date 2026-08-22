import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportsTab({ employees }) {
  const [attendance, setAttendance] = useState({ loading: true, records: [], available: true });
  const [payroll, setPayroll] = useState({ loading: true, records: [], available: true });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/attendance/all?range=weekly');
        setAttendance({ loading: false, records: data.data?.records || data.data || [], available: true });
      } catch {
        setAttendance({ loading: false, records: [], available: false });
      }
    })();
    (async () => {
      try {
        const { data } = await api.get('/payroll/all');
        setPayroll({ loading: false, records: data.data?.records || data.data || [], available: true });
      } catch {
        setPayroll({ loading: false, records: [], available: false });
      }
    })();
  }, []);

  const attendanceByEmployee = useMemo(() => {
    const map = new Map();
    for (const rec of attendance.records) {
      const key = rec.userId;
      if (!map.has(key)) map.set(key, { present: 0, absent: 0, 'half-day': 0, leave: 0 });
      const bucket = map.get(key);
      if (bucket[rec.status] !== undefined) bucket[rec.status] += 1;
    }
    return map;
  }, [attendance.records]);

  const payslip = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return payroll.records.find(
      (p) => String(p.userId) === String(selectedEmployeeId) && Number(p.month) === Number(selectedMonth) && Number(p.year) === Number(selectedYear)
    ) || null;
  }, [payroll.records, selectedEmployeeId, selectedMonth, selectedYear]);

  const selectedEmployee = employees.find((e) => String(e.id) === String(selectedEmployeeId));

  return (
    <div>
      <div className="card">
        <h2>Weekly attendance summary</h2>
        {attendance.loading ? (
          <p>Loading…</p>
        ) : !attendance.available ? (
          <p style={{ color: '#888' }}>Attendance module isn't available yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Employee</th><th>Present</th><th>Absent</th><th>Half-day</th><th>Leave</th></tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const counts = attendanceByEmployee.get(emp.id) || { present: 0, absent: 0, 'half-day': 0, leave: 0 };
                return (
                  <tr key={emp.id}>
                    <td>{emp.name}</td>
                    <td>{counts.present}</td>
                    <td>{counts.absent}</td>
                    <td>{counts['half-day']}</td>
                    <td>{counts.leave}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <h2>Salary slip</h2>
        {!payroll.available ? (
          <p style={{ color: '#888' }}>Payroll module isn't available yet.</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)}>
                <option value="">Select employee…</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ width: 90 }} />
            </div>

            {!selectedEmployeeId ? (
              <p style={{ color: '#888' }}>Pick an employee and period to view a payslip.</p>
            ) : !payslip ? (
              <p style={{ color: '#888' }}>No payroll record for {selectedEmployee?.name} in {MONTHS[selectedMonth - 1]} {selectedYear}.</p>
            ) : (
              <div className="card" style={{ maxWidth: 380, background: '#fafafa' }}>
                <h3 style={{ marginTop: 0 }}>{selectedEmployee?.name} — {MONTHS[selectedMonth - 1]} {selectedYear}</h3>
                <dl className="detail-grid">
                  <dt>Base salary</dt><dd>₹{Number(payslip.baseSalary).toLocaleString('en-IN')}</dd>
                  <dt>Allowances</dt><dd>₹{Number(payslip.allowances).toLocaleString('en-IN')}</dd>
                  <dt>Deductions</dt><dd>₹{Number(payslip.deductions).toLocaleString('en-IN')}</dd>
                  <dt><strong>Net salary</strong></dt><dd><strong>₹{Number(payslip.netSalary).toLocaleString('en-IN')}</strong></dd>
                </dl>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
