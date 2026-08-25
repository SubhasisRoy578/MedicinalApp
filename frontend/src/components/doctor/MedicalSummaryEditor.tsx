import React, { useState } from 'react';
import { MedicalSummary } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import {
  HeartPulse,
  FileText,
  Pill,
  ShieldAlert,
  Scissors,
  Users,
  TestTube,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Edit2
} from 'lucide-react';
import { consultationsApi } from '../../api/consultations';
import { useToast } from '../../context/ToastContext';

interface MedicalSummaryEditorProps {
  consultationId: number;
  summary: MedicalSummary;
  isVerified: boolean;
  onSummaryUpdated: () => void;
}

export const MedicalSummaryEditor: React.FC<MedicalSummaryEditorProps> = ({
  consultationId,
  summary: initialSummary,
  isVerified,
  onSummaryUpdated,
}) => {
  const [formData, setFormData] = useState<Partial<MedicalSummary>>({
    chief_complaint: initialSummary.chief_complaint || '',
    symptoms: initialSummary.symptoms || '',
    duration: initialSummary.duration || '',
    severity: initialSummary.severity || '',
    past_history: initialSummary.past_history || '',
    medications: initialSummary.medications || '',
    allergies: initialSummary.allergies || '',
    surgeries: initialSummary.surgeries || '',
    family_history: initialSummary.family_history || '',
    investigation_results: initialSummary.investigation_results || '',
    previous_diagnosis: initialSummary.previous_diagnosis || '',
    ai_summary: initialSummary.ai_summary || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const handleChange = (field: keyof MedicalSummary, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await consultationsApi.updateSummary(consultationId, formData);
      success('Medical history summary updated and logged.');
      onSummaryUpdated();
    } catch (err: any) {
      error(err.message || 'Failed to update summary');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Structured Medical History Summary</span>
            {isVerified && <ProvenanceBadge type="DOCTOR" />}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Every clinical field is fully editable by the attending physician prior to verification.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Summary Changes'}</span>
        </button>
      </div>

      {/* Grid of editable medical fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Chief Complaint */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              Chief Complaint
            </label>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <textarea
            value={formData.chief_complaint}
            onChange={(e) => handleChange('chief_complaint', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
            placeholder="Primary reason for consultation..."
          />
        </div>

        {/* Presenting Symptoms & Severity */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-orange-500" />
              Symptoms & Characteristics
            </label>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <textarea
            value={formData.symptoms}
            onChange={(e) => handleChange('symptoms', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Presenting complaints, onset, duration..."
          />
        </div>

        {/* Duration & Severity */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Duration & Severity Index
            </label>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-full mt-1 p-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:border-teal-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Severity</span>
              <input
                type="text"
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                className="w-full mt-1 p-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Past Medical History */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Past Medical History & Chronic Illnesses
            </label>
            <ProvenanceBadge type="AI" />
          </div>
          <textarea
            value={formData.past_history}
            onChange={(e) => handleChange('past_history', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Chronic diagnoses (HTN, Diabetes, CAD, etc.)..."
          />
        </div>

        {/* Current Medications */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-purple-500" />
              Current Medications & Dosages
            </label>
            <ProvenanceBadge type="AI" />
          </div>
          <textarea
            value={formData.medications}
            onChange={(e) => handleChange('medications', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Prescription medicines, dosages, frequencies..."
          />
        </div>

        {/* Allergies */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Known Allergies (Drug / Food)
            </label>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <textarea
            value={formData.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-amber-900"
            placeholder="Drug, food, or environmental allergies..."
          />
        </div>

        {/* Surgeries & Procedures */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-slate-500" />
              Previous Surgeries & Hospitalizations
            </label>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <textarea
            value={formData.surgeries}
            onChange={(e) => handleChange('surgeries', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Prior surgical operations, dates, hospitals..."
          />
        </div>

        {/* Family Medical History */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Family Medical History
            </label>
            <ProvenanceBadge type="PATIENT" />
          </div>
          <textarea
            value={formData.family_history}
            onChange={(e) => handleChange('family_history', e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            placeholder="Familial or hereditary diseases..."
          />
        </div>

        {/* Diagnostic Investigations from OCR */}
        <div className="md:col-span-2 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TestTube className="w-3.5 h-3.5 text-teal-600" />
              Diagnostic Lab Investigations & Findings (from OCR Documents)
            </label>
            <ProvenanceBadge type="OCR" />
          </div>
          <textarea
            value={formData.investigation_results}
            onChange={(e) => handleChange('investigation_results', e.target.value)}
            rows={3}
            className="w-full p-3 font-mono text-xs text-slate-900 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all leading-relaxed"
            placeholder="Extracted laboratory values, ECG findings, imaging conclusions..."
          />
        </div>

        {/* AI Synthesis Overview Box */}
        <div className="md:col-span-2 p-4 rounded-2xl border border-teal-200 bg-teal-50/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Synthesized Clinical Summary
            </label>
            <ProvenanceBadge type="AI" />
          </div>
          <textarea
            value={formData.ai_summary}
            onChange={(e) => handleChange('ai_summary', e.target.value)}
            rows={4}
            className="w-full p-3 text-xs text-slate-800 border border-teal-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all leading-relaxed"
            placeholder="Overall clinical summary synthesis..."
          />
        </div>
      </div>
    </div>
  );
};
