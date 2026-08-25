import React from 'react';
import { ConsultationStatus } from '../../types';
import { Clock, Hourglass, CheckCircle, ShieldCheck, PlusCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ConsultationStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'CREATED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
          Created
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          <Hourglass className="w-3.5 h-3.5 text-blue-500 animate-spin" />
          In Progress
        </span>
      );
    case 'WAITING_FOR_DOCTOR':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          Pending Doctor Review
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Doctor Verified
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 ${className}`}>
          <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
          Completed
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 ${className}`}>
          {status}
        </span>
      );
  }
};
