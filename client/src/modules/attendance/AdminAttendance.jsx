import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from './StatusBadge';

export default function AdminAttendance() {
  const [records, setRecords] = useState([]);
  const [range, setRange] = useState('weekly');
  const [loading, setLoading] = useState(true);

  const fetchAllAttendance = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/all?range=${selectedRange}`);
      if (res.data && res.data.success) {
        setRecords(res.data.data.records || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAttendance(range);
  }, [range]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Company Attendance (Admin)</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Read-only view of all employee attendance records.
            </p>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setRange('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === 'daily' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setRange('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === 'weekly' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly (7 Days)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading company records...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No employee attendance logs found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {rec.user?.name || `User #${rec.userId}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">
                      {rec.user?.employeeId || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{rec.date}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{formatTime(rec.checkInTime)}</td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{formatTime(rec.checkOutTime)}</td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={rec.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
