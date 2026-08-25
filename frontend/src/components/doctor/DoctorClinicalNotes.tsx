import React, { useState } from 'react';
import { Stethoscope, FileSpreadsheet, Pill, Save, CheckCircle, Clock } from 'lucide-react';
import { consultationsApi } from '../../api/consultations';
import { useToast } from '../../context/ToastContext';

interface DoctorClinicalNotesProps {
  consultationId: number;
  initialNotes?: string;
  initialExam?: string;
  initialDiagnosis?: string;
  initialPlan?: string;
  onNotesSaved?: () => void;
}

export const DoctorClinicalNotes: React.FC<DoctorClinicalNotesProps> = ({
  consultationId,
  initialNotes = '',
  initialExam = '',
  initialDiagnosis = '',
  initialPlan = '',
  onNotesSaved,
}) => {
  const [doctorNotes, setDoctorNotes] = useState(initialNotes);
  const [physicalExam, setPhysicalExam] = useState(initialExam);
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState(initialDiagnosis);
  const [prescriptionPlan, setPrescriptionPlan] = useState(initialPlan);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await consultationsApi.saveDoctorNotes(consultationId, {
        doctor_notes: doctorNotes,
        physical_examination: physicalExam,
        provisional_diagnosis: provisionalDiagnosis,
        prescription_plan: prescriptionPlan,
      });
      success('Doctor clinical examination & treatment plan saved successfully.');
      if (onNotesSaved) onNotesSaved();
    } catch (err: any) {
      error(err.message || 'Failed to save doctor clinical notes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-teal-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Attending Physician Clinical Notes & Treatment Plan
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            These sections belong exclusively to the consulting physician and record direct findings, diagnosis, and prescription.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving Notes...' : 'Save Clinical Notes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Physical Examination Findings */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            Physical Examination & Vitals
          </label>
          <textarea
            value={physicalExam}
            onChange={(e) => setPhysicalExam(e.target.value)}
            rows={3}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            placeholder="BP, Pulse, Chest auscultation, S1/S2 heard, clear breath sounds, abdominal exam..."
          />
        </div>

        {/* Doctor Impression & Diagnosis */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            Provisional / Confirmed Diagnosis
          </label>
          <textarea
            value={provisionalDiagnosis}
            onChange={(e) => setProvisionalDiagnosis(e.target.value)}
            rows={3}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
            placeholder="Clinical diagnosis by physician (e.g. Atypical Angina, Grade-II Essential HTN, Dyslipidemia)..."
          />
        </div>

        {/* Prescription & Treatment Plan */}
        <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-purple-600" />
            Prescription (Rx) & Management Plan
          </label>
          <textarea
            value={prescriptionPlan}
            onChange={(e) => setPrescriptionPlan(e.target.value)}
            rows={4}
            className="w-full p-3 font-mono text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
            placeholder="1. Tab. Telmisartan 40mg - 1 OD (Morning) x 30 days&#10;2. Tab. Rosuvastatin 10mg - 1 HS (Night) x 30 days&#10;Advice: Low sodium diet, 30 min daily walking, follow-up in 2 weeks with repeat lipid profile."
          />
        </div>

        {/* General Clinical Observations */}
        <div className="md:col-span-2 p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            General Doctor Clinical Notes & Follow-up Instructions
          </label>
          <textarea
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            placeholder="Additional clinical remarks, patient counseling notes, referral details..."
          />
        </div>
      </div>
    </div>
  );
};
