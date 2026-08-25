import React, { useState } from 'react';
import { MedicalSummary, Consultation } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import {
  FileText,
  User,
  HeartPulse,
  Pill,
  ShieldAlert,
  Scissors,
  Users,
  TestTube,
  CheckCircle,
  Sparkles,
  Edit3,
  Save,
  Send
} from 'lucide-react';
import { consultationsApi } from '../../api/consultations';
import { useToast } from '../../context/ToastContext';

interface SummaryReviewProps {
  consultation: Consultation;
  summary: MedicalSummary;
  onSubmitToDoctor: () => void;
  isSubmitting?: boolean;
}

export const SummaryReview: React.FC<SummaryReviewProps> = ({
  consultation,
  summary: initialSummary,
  onSubmitToDoctor,
  isSubmitting = false,
}) => {
  const [summary, setSummary] = useState<MedicalSummary>(initialSummary);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [patientRemarks, setPatientRemarks] = useState(initialSummary.patient_description || '');
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);
  const { success, error } = useToast();

  const handleSaveRemarks = async () => {
    try {
      setIsSavingRemarks(true);
      const updated = await consultationsApi.updateSummary(consultation.id, {
        patient_description: patientRemarks,
      });
      setSummary(updated);
      setIsEditingRemarks(false);
      success('Your remarks have been updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update remarks');
    } finally {
      setIsSavingRemarks(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
              Pre-Consultation Clinical Intake Ready
            </span>
            <h2 className="text-xl font-black mt-2">Your Medical History Has Been Prepared</h2>
            <p className="text-xs text-teal-100 mt-1">
              Please review the organized summary below before sending it to your consulting doctor.
            </p>
          </div>
          <button
            type="button"
            onClick={onSubmitToDoctor}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-teal-900 font-extrabold text-xs hover:bg-teal-50 transition-all shadow-lg shadow-teal-900/20 active:scale-95"
          >
            <Send className="w-4 h-4 text-teal-600" />
            <span>{isSubmitting ? 'Submitting to Doctor...' : 'Submit to Doctor Now →'}</span>
          </button>
        </div>
      </div>

      {/* Clinical Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>AI Organization Active:</strong> Information from your answers and diagnostic reports has been structured into clinical categories. Your doctor will review, examine, and medically verify these points during your appointment.
        </div>
      </div>

      {/* Summary Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chief Complaint & Symptoms */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Chief Complaint & Symptoms</h3>
            </div>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <div className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {summary.chief_complaint || 'General medical consultation'}
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>Reported Symptoms:</strong> {summary.symptoms || 'None specified'}</div>
            <div><strong>Duration:</strong> {summary.duration || 'Not specified'}</div>
            <div><strong>Severity:</strong> {summary.severity || 'Not graded'}</div>
          </div>
        </div>

        {/* Past Medical History & Diagnoses */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Past Medical History</h3>
            </div>
            <ProvenanceBadge type="AI" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {summary.past_history || 'No significant chronic medical illnesses recorded.'}
          </div>
          {summary.previous_diagnosis && summary.previous_diagnosis !== 'No past diagnostic records provided.' && (
            <div className="text-xs text-slate-600">
              <strong>Prior Diagnoses on File:</strong> {summary.previous_diagnosis}
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Current Medications</h3>
            </div>
            <ProvenanceBadge type="AI" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {summary.medications || 'No active daily medications recorded.'}
          </div>
        </div>

        {/* Allergies & Precautions */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Allergies & Sensitivities</h3>
            </div>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
            {summary.allergies || 'No known drug or food allergies (NKDA).'}
          </div>
        </div>

        {/* Previous Surgeries & Family History */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Surgeries & Family History</h3>
            </div>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <div className="text-xs text-slate-600 space-y-2">
            <div><strong>Surgical History:</strong> {summary.surgeries || 'No prior surgical history.'}</div>
            <div><strong>Family Medical History:</strong> {summary.family_history || 'Non-contributory.'}</div>
          </div>
        </div>

        {/* Uploaded Diagnostic Investigations */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Extracted Investigation Results</h3>
            </div>
            <ProvenanceBadge type="OCR" />
          </div>
          <div className="text-xs font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
            {summary.investigation_results || 'No diagnostic documents uploaded.'}
          </div>
        </div>
      </div>

      {/* Patient's Own Description & Remarks Section */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Your Personal Remarks for the Doctor
            </h3>
          </div>
          {!isEditingRemarks && (
            <button
              type="button"
              onClick={() => setIsEditingRemarks(true)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Remarks
            </button>
          )}
        </div>

        {isEditingRemarks ? (
          <div className="space-y-3">
            <textarea
              value={patientRemarks}
              onChange={(e) => setPatientRemarks(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs text-slate-800 border border-teal-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Add or correct any additional details you'd like your doctor to know..."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingRemarks(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRemarks}
                disabled={isSavingRemarks}
                className="px-4 py-1.5 text-xs font-bold bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-1 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingRemarks ? 'Saving...' : 'Save Remarks'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {summary.patient_description || 'No additional personal remarks provided.'}
          </div>
        )}
      </div>

      {/* Doctor Submission Bar */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Ready to consult your physician?</h4>
          <p className="text-xs text-slate-500">
            Submitting will make this structured profile available in the clinical doctor queue.
          </p>
        </div>
        <button
          type="button"
          onClick={onSubmitToDoctor}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition-all shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 active:scale-95"
        >
          <CheckCircle className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting to Doctor...' : 'Submit to Doctor'}</span>
        </button>
      </div>
    </div>
  );
};
