import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { User, AdminStats, AuditLog } from '../../types';
import {
  Shield,
  Users,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  History,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'USERS' | 'AUDIT'>('USERS');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, logsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getAllAuditLogs(50),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setAuditLogs(logsData);
    } catch (err: any) {
      error(err.message || 'Failed to load admin metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (userId: number) => {
    try {
      const res = await adminApi.toggleUserStatus(userId);
      success(res.message);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: res.is_active } : u))
      );
    } catch (err: any) {
      error(err.message || 'Failed to update user status');
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading system admin portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">MediKiosk Operations & Security</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor clinical platform metrics, manage user authorizations, and inspect HIPAA-compliant audit trails.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_users}</div>
            <div className="text-[11px] text-slate-400">
              {stats.total_patients} Patients • {stats.total_doctors} Doctors
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Consultations</span>
              <Activity className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_consultations}</div>
            <div className="text-[11px] text-slate-400">{stats.pending_reviews} pending doctor review</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Verified & Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {stats.verified_consultations + stats.completed_consultations}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">Doctor verified histories</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>OCR Reports Processed</span>
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_reports_processed}</div>
            <div className="text-[11px] text-slate-400">Prescriptions, labs & summaries</div>
          </div>
        </div>
      )}

      {/* Tabs: Users Table vs System Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'USERS'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Registered Users Directory ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'AUDIT'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              System Audit Trail ({auditLogs.length})
            </button>
          </div>
        </div>

        {/* USERS TABLE */}
        {activeTab === 'USERS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Name</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Registered On</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-2 text-slate-600">{u.email}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          u.role === 'DOCTOR'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.is_active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AUDIT LOGS TABLE */}
        {activeTab === 'AUDIT' && (
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-teal-700">{log.action}</span>
                    {log.consultation_id && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Consultation #{log.consultation_id}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    User: <span className="font-medium">{log.user_email || 'System'}</span>
                  </div>
                  {log.details && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
