import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, FileText, Lock } from 'lucide-react';

interface ConsentCardProps {
  onConsentGiven: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConsentCard: React.FC<ConsentCardProps> = ({
  onConsentGiven,
  onCancel,
  isLoading = false,
}) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-slide-up">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-teal-100" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Before We Begin</h2>
            <p className="text-xs text-teal-100 mt-0.5">Patient Consultation Consent & Clinical Privacy</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Medical Advisory Box */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Important Clinical Notice:</span> Your answers and uploaded medical documents will help create an organized medical history summary for your consulting doctor. <span className="font-semibold underline">This AI system does not replace professional medical diagnosis, physical examination, or treatment advice.</span>
          </div>
        </div>

        {/* Privacy Guarantees */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" /> How Your Health Data Is Handled
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 pl-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span><strong>Restricted Doctor Access:</strong> Only your authorized consulting physician will review your structured answers and uploaded reports.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span><strong>Encrypted & Logged:</strong> All records are transmitted securely and every clinical modification is recorded in an immutable audit trail.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              <span><strong>Full Doctor Verification:</strong> The doctor personally inspects and verifies every piece of summarized information before completing the consultation.</span>
            </li>
          </ul>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-4 border-t border-slate-100">
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 leading-snug">
              I understand and consent to provide my health information, symptoms, and previous medical documents for this clinical consultation.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConsentGiven}
            disabled={!agreed || isLoading}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              agreed && !isLoading
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isLoading ? 'Processing Consent...' : 'Continue to Language Selection →'}
          </button>
        </div>
      </div>
    </div>
  );
};
