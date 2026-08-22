import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [range, setRange] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAttendance = async (selectedRange = range) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/me?range=${selectedRange}`);
      if (res.data && res.data.success) {
        const fetchedRecords = res.data.data.records || [];
        setRecords(fetchedRecords);

        // Find today's record
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRec = fetchedRecords.find((r) => r.date === todayStr) || null;
        setTodayRecord(todayRec);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(range);
  }, [range]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/checkin');
      if (res.data && res.data.success) {
        toast.success('Checked in successfully');
        fetchAttendance(range);
      }
    } catch (err) {
      // Toast handled by axios interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/attendance/checkout');
      if (res.data && res.data.success) {
        toast.success('Checked out successfully');
        fetchAttendance(range);
      }
    } catch (err) {
      // Toast handled by axios interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCheckedIn = todayRecord && todayRecord.checkInTime && !todayRecord.checkOutTime;
  const isCompleted = todayRecord && todayRecord.checkInTime && todayRecord.checkOutTime;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header & Shift Action Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white">Employee Attendance</h2>
          <p className="text-slate-400 text-sm mt-1">
            Track your daily working shifts and view timesheet logs.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-slate-400">Today's Status:</span>
            <StatusBadge status={todayRecord?.status || (isCheckedIn ? 'present' : 'absent')} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {!isCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : isCompleted ? 'Re-Check In' : 'Check In'}
            </button>
          ) : (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
            >
              {actionLoading ? 'Processing...' : 'Check Out'}
            </button>
          )}
        </div>
      </div>

      {/* Attendance History Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">Attendance Logs</h3>
          
          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setRange('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === 'daily' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setRange('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                range === 'weekly' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weekly (7 Days)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading logs...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No attendance records found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{rec.date}</td>
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
