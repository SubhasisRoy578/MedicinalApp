import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, X, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isVerifying?: boolean;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isVerifying = false,
}) => {
  const { user } = useAuth();
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
        <div className="p-5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Verify Medical History</h3>
              <p className="text-[11px] text-teal-100">Physician Clinical Attestation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-relaxed">
            <p className="font-semibold">Clinical Verification Protocol:</p>
            <p className="mt-1 text-teal-800">
              By verifying, you confirm that you have reviewed the patient's chief complaints, symptom details, past history, and diagnostic reports, modifying any inaccuracies necessary for clinical accuracy.
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div><strong>Verifying Doctor:</strong> {user?.name || 'Dr. Attending'}</div>
            <div><strong>Specialization:</strong> {user?.doctor_profile?.specialization || 'Cardiology & Internal Medicine'}</div>
            <div><strong>Attestation Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-300 hover:border-teal-500 transition-colors cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 leading-snug">
              I have reviewed and verified this patient's medical history summary for clinical consultation and care.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!confirmedCheck || isVerifying}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                confirmedCheck && !isVerifying
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/25'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying...' : 'Confirm Clinical Verification'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
