import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorApi } from '../../api/doctor';
import { Consultation } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Stethoscope,
  Search,
  Clock,
  CheckCircle2,
  Hourglass,
  Users,
  FileText,
  ChevronRight,
  Filter,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DoctorDashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    today_consultations: number;
    pending_reviews: number;
    in_progress: number;
    verified_consultations: number;
    completed_consultations: number;
    total_patients: number;
  }>({
    today_consultations: 0,
    pending_reviews: 0,
    in_progress: 0,
    verified_consultations: 0,
    completed_consultations: 0,
    total_patients: 0,
  });

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [triageAlerts, setTriageAlerts] = useState<any[]>([]);
  const { error } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, consData, alertsData] = await Promise.all([
        doctorApi.getDashboardStats(),
        doctorApi.getConsultations({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchTerm || undefined,
        }),
        doctorApi.getTriageAlerts(),
      ]);
      setStats(statsData);
      setConsultations(consData);
      setTriageAlerts(alertsData);
    } catch (err: any) {
      error(err.message || 'Failed to load doctor dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      try {
        const alerts = await doctorApi.getTriageAlerts();
        setTriageAlerts(alerts);
      } catch {
        // Keep the existing dashboard state if the polling request fails.
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Clinical Physician Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Doctor Consultation Studio</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review AI-organized pre-consultation medical histories, inspect uploaded diagnostic reports & OCR findings, and verify clinical summaries.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {triageAlerts.length > 0 && (
        <div className="rounded-3xl border-2 border-rose-300 bg-rose-50 shadow-lg shadow-rose-500/10 overflow-hidden">
          <div className="p-5 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-rose-950">Active Triage Alerts</h2>
                <p className="text-[11px] text-rose-800">Urgent patient-reported red flags requiring prompt staff assessment.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-black">{triageAlerts.length}</span>
          </div>
          <div className="divide-y divide-rose-200">
            {triageAlerts.map((alert) => (
              <div key={alert.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span className="text-xs font-black text-rose-950">Consultation #{alert.consultation_id}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">{alert.severity}</span>
                  </div>
                  <p className="text-xs text-rose-900 mt-2">{alert.reason}</p>
                  <p className="text-[10px] text-rose-700 mt-1">
                    Created {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/doctor/consultations/${alert.consultation_id}/review`}
                    className="px-3 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
                  >
                    Open Patient
                  </Link>
                  <button
                    onClick={async () => {
                      try {
                        await doctorApi.acknowledgeTriageAlert(alert.id);
                        setTriageAlerts((prev) => prev.filter((item) => item.id !== alert.id));
                      } catch (err: any) {
                        error(err.message || 'Could not acknowledge triage alert');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Reviews */}
        <div
          onClick={() => setStatusFilter('WAITING_FOR_DOCTOR')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'WAITING_FOR_DOCTOR'
              ? 'border-amber-400 bg-amber-50/60 shadow-md ring-2 ring-amber-400/20'
              : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Pending Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.pending_reviews}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting physician verification</p>
        </div>

        {/* Today's Consultations */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'border-teal-500 bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800">Today's Intake</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.today_consultations}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total consultations today</p>
        </div>

        {/* Verified */}
        <div
          onClick={() => setStatusFilter('VERIFIED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'VERIFIED'
              ? 'border-emerald-500 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Doctor Verified</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.verified_consultations}</div>
          <p className="text-[11px] text-slate-500 mt-1">Attested medical records</p>
        </div>

        {/* Total Patients */}
        <Link
          to="/doctor/patients"
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Patient Directory</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total_patients}</div>
          <p className="text-[11px] text-slate-500 mt-1">Searchable patient database →</p>
        </Link>
      </div>

      {/* Main Consultations Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {['ALL', 'WAITING_FOR_DOCTOR', 'IN_PROGRESS', 'VERIFIED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st === 'ALL'
                  ? 'All Records'
                  : st === 'WAITING_FOR_DOCTOR'
                  ? 'Pending Review'
                  : st === 'IN_PROGRESS'
                  ? 'In Progress'
                  : st === 'VERIFIED'
                  ? 'Verified'
                  : 'Completed'}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patient name, email, phone..."
              className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </form>
        </div>

        {/* Consultations Table */}
        {consultations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No consultations matching current filter or search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Patient</th>
                  <th className="pb-3 px-2">Consultation</th>
                  <th className="pb-3 px-2">Language</th>
                  <th className="pb-3 px-2">Reports & OCR</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((cons) => (
                  <tr key={cons.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Patient info */}
                    <td className="py-4 px-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {cons.patient?.name || 'Patient'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cons.patient?.email} • {cons.patient?.phone || 'No phone'}
                      </div>
                    </td>

                    {/* Consultation ID & Date */}
                    <td className="py-4 px-2">
                      <div className="font-semibold text-slate-800">
                        Consultation #{cons.id}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(cons.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Language */}
                    <td className="py-4 px-2">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {cons.language}
                      </span>
                    </td>

                    {/* Reports count */}
                    <td className="py-4 px-2">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        {cons.reports_count || 0} Attached
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-2">
                      <StatusBadge status={cons.status} />
                    </td>

                    {/* Action button */}
                    <td className="py-4 px-2 text-right">
                      <Link
                        to={`/doctor/consultations/${cons.id}/review`}
                        className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          cons.status === 'WAITING_FOR_DOCTOR'
                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        <span>
                          {cons.status === 'WAITING_FOR_DOCTOR'
                            ? 'Review & Verify →'
                            : 'Open Review Studio →'}
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
