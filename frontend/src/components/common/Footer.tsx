import React from 'react';
import { Activity, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto gov-section-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-black text-slate-900">
                MediKiosk
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Better medical history. Smarter consultations. AI-assisted clinical history documentation empowering healthcare providers to focus on what matters most — examination, diagnosis, and empathetic patient care.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> HIPAA / Clinical Privacy Aligned
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-teal-600" /> Physician Verification First
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Workflow</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>1. Pre-Consultation Consent</li>
              <li>2. Multilingual Interview (EN / HI / BN)</li>
              <li>3. Voice & Text Speech Input</li>
              <li>4. Diagnostic Report OCR</li>
              <li>5. Doctor Clinical Verification</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Clinical Safety</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI summaries are strictly for clinical workflow support and administrative intake. AI does not diagnose, prescribe, or replace the professional medical judgment of a licensed medical practitioner.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 MediKiosk Health Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-teal-600 transition-colors">Privacy Policy</span>
            <span className="hover:text-teal-600 transition-colors">Clinical Standards</span>
            <span className="hover:text-teal-600 transition-colors">Support & Feedback</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
