import React from 'react';
import { User, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export type ProvenanceType = 'PATIENT' | 'OCR' | 'AI' | 'DOCTOR';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'PATIENT':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 ${className}`}>
          <User className="w-3 h-3" />
          PATIENT PROVIDED
        </span>
      );
    case 'OCR':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          <FileText className="w-3 h-3" />
          OCR EXTRACTED
        </span>
      );
    case 'AI':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <Sparkles className="w-3 h-3" />
          AI ORGANIZED
        </span>
      );
    case 'DOCTOR':
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${className}`}>
          <CheckCircle2 className="w-3 h-3" />
          DOCTOR VERIFIED
        </span>
      );
    default:
      return null;
  }
};
