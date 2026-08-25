import React from 'react';
import { AuditLog } from '../../types';
import { History, User, CheckCircle2, FileEdit, Upload, Check } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
        No audit events recorded yet.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'DOCTOR_VERIFIED_SUMMARY':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'MEDICAL_SUMMARY_EDITED':
      case 'DOCTOR_NOTES_UPDATED':
        return <FileEdit className="w-4 h-4 text-amber-600" />;
      case 'REPORT_UPLOADED_AND_PROCESSED':
        return <Upload className="w-4 h-4 text-purple-600" />;
      default:
        return <History className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <History className="w-4 h-4 text-teal-600" />
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Clinical Audit Trail & Modification History
        </h4>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
          >
            <div className="mt-0.5">{getActionIcon(log.action)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                By: <span className="font-medium text-slate-700">{log.user_email || 'System'}</span>
              </div>
              {log.details && (
                <div className="mt-1 text-[10px] font-mono text-slate-500 bg-white p-1.5 rounded border border-slate-200">
                  {JSON.stringify(log.details)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
