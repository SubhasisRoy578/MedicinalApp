import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { consultationsApi } from '../../api/consultations';
import { reportsApi } from '../../api/reports';
import { Consultation, MedicalSummary, MedicalReport, AuditLog } from '../../types';
import { MedicalSummaryEditor } from '../../components/doctor/MedicalSummaryEditor';
import { DoctorClinicalNotes } from '../../components/doctor/DoctorClinicalNotes';
import { VerificationModal } from '../../components/doctor/VerificationModal';
import { AuditLogViewer } from '../../components/doctor/AuditLogViewer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import {
  Stethoscope,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Eye,
  History,
  Check,
  Sparkles,
  Download,
  FileSpreadsheet,
  TestTube,
  RefreshCw,
  HelpCircle,
  Clock,
  ShieldCheck,
  User,
  Leaf
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DoctorConsultationReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const consultationId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'ANSWERS' | 'REPORTS' | 'NOTES' | 'AUDIT'>('SUMMARY');
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inspectReport, setInspectReport] = useState<MedicalReport | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadConsultationData = async () => {
    if (!consultationId) return;
    try {
      setIsLoading(true);
      const [consData, logsData] = await Promise.all([
        consultationsApi.getById(consultationId),
        consultationsApi.getAuditLogs(consultationId),
      ]);
      setConsultation(consData);
      setAuditLogs(logsData);
    } catch (err: any) {
      error(err.message || 'Failed to load consultation data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsultationData();
  }, [consultationId]);

  const handleVerifyConfirm = async () => {
    try {
      setIsVerifying(true);
      const updated = await consultationsApi.verifyConsultation(consultationId);
      setConsultation(updated);
      setIsVerificationModalOpen(false);
      success('Medical history verified successfully with your clinical attestation.');
      await loadConsultationData();
    } catch (err: any) {
      error(err.message || 'Failed to verify consultation');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      setIsCompleting(true);
      const updated = await consultationsApi.completeConsultation(consultationId);
      setConsultation((prev) => (prev ? { ...prev, status: updated.status } : null));
      success('Consultation marked as COMPLETED.');
      await loadConsultationData();
    } catch (err: any) {
      error(err.message || 'Failed to complete consultation');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading clinical review studio...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">Consultation record not found.</p>
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const patient = consultation.patient;
  const isVerified = consultation.summary?.doctor_verified || false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/dashboard"
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-900">
            Consultation Review #{consultation.id}
          </span>
        </div>

        {/* Doctor Verification Actions */}
        <div className="flex items-center gap-2">
          {!isVerified ? (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Medical History</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified by Doctor
              </span>
              {consultation.status !== 'COMPLETED' && (
                <button
                  onClick={handleCompleteConsultation}
                  disabled={isCompleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 text-teal-400" />
                  <span>{isCompleting ? 'Completing...' : 'Mark Consultation Completed'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient Clinical Profile Header Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
            {patient?.name.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900">{patient?.name}</h1>
              <StatusBadge status={consultation.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>DOB: {patient?.patient_profile?.date_of_birth || '1984-06-15'}</span>
              <span>•</span>
              <span>Gender: {patient?.patient_profile?.gender || 'Male'}</span>
              <span>•</span>
              <span>Blood Group: <strong>{patient?.patient_profile?.blood_group || 'B+'}</strong></span>
              <span>•</span>
              <span>Intake Language: <strong>{consultation.language}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-right">
            <div>Intake Date: {new Date(consultation.created_at).toLocaleDateString()}</div>
            <div>Reports: {consultation.reports?.length || 0} Attached</div>
          </div>
        </div>
      </div>

      {/* Fixed: Line 204 */}
      {(consultation as any).mode === 'AYUSH' && (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">AYUSH OPD Intake</div>
              <h2 className="text-sm font-black text-amber-950 mt-1">Prakriti / Vikriti / Agni / Koshtha / Ahara / Vihara questions included</h2>
              <p className="text-[11px] text-amber-900 mt-1">
                These fields are patient-reported or previously documented. Review them clinically; the software does not infer an AYUSH diagnosis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Review Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-xs gap-1">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'SUMMARY'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Medical Summary & Edit</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTES')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'NOTES'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Clinical Notes & Rx</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'REPORTS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Reports & OCR Inspector ({consultation.reports?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('ANSWERS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ANSWERS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient Answers Transcript ({consultation.answers?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'AUDIT'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Audit Trail</span>
        </button>
      </div>

      {/* TAB 1: AI MEDICAL SUMMARY EDITOR */}
      {activeTab === 'SUMMARY' && consultation.summary && (
        <div className="space-y-5">
          {/* Fixed: Line 287 */}
          {(consultation as any).mode === 'AYUSH' && consultation.summary.extracted_report_information?.ayush_assessment && (
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6">
              <h3 className="text-sm font-black text-amber-950">AYUSH Intake Summary</h3>
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                {Object.entries(consultation.summary.extracted_report_information.ayush_assessment).map(([key, values]) => (
                  <div key={key} className="bg-white/80 rounded-2xl border border-amber-100 p-4">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">{key}</div>
                    <div className="text-xs text-slate-800 mt-1">{(values as string[]).join('; ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <MedicalSummaryEditor
              consultationId={consultationId}
              summary={consultation.summary}
              isVerified={isVerified}
              onSummaryUpdated={loadConsultationData}
            />
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR CLINICAL NOTES & PRESCRIPTION */}
      {activeTab === 'NOTES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <DoctorClinicalNotes
            consultationId={consultationId}
            initialNotes={consultation.summary?.doctor_notes || ''}
            initialExam={consultation.summary?.physical_examination || ''}
            initialDiagnosis={consultation.summary?.provisional_diagnosis || ''}
            initialPlan={consultation.summary?.prescription_plan || ''}
            onNotesSaved={loadConsultationData}
          />
        </div>
      )}

      {/* TAB 3: UPLOADED REPORTS & OCR INSPECTOR */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Uploaded Medical Documents & OCR Extractions</h3>
              <p className="text-xs text-slate-500">
                Inspect raw OCR text layers and extracted laboratory parameters alongside original files.
              </p>
            </div>
            <ProvenanceBadge type="OCR" />
          </div>

          {!consultation.reports || consultation.reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No medical reports were uploaded for this consultation.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {consultation.reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rep.filename}</h4>
                        <div className="text-[11px] text-slate-400">
                          {(rep.file_size / 1024).toFixed(1)} KB • {rep.file_type} • Uploaded {new Date(rep.uploaded_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectReport(rep)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Raw OCR Text</span>
                      </button>
                    </div>
                  </div>

                  {/* OCR Snippet Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                    {rep.ocr_text || 'OCR processing complete.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORIGINAL PATIENT ANSWERS TRANSCRIPT */}
      {activeTab === 'ANSWERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Original Patient Intake Transcript</h3>
              <p className="text-xs text-slate-500">
                Verbatim answers recorded directly during the guided AI interview.
              </p>
            </div>
            <ProvenanceBadge type="PATIENT" />
          </div>

          {!consultation.answers || consultation.answers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No interview answers recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {consultation.answers.map((ans, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      [{ans.category || 'Intake'}] {ans.question_text}
                    </span>
                    <span className="text-[10px] font-semibold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {ans.answer_type} input
                    </span>
                  </div>
                  <div className="text-xs text-slate-900 font-medium bg-white p-3 rounded-xl border border-slate-200">
                    {ans.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <AuditLogViewer logs={auditLogs} />
      )}

      {/* Doctor Clinical Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onConfirm={handleVerifyConfirm}
        isVerifying={isVerifying}
      />

      {/* Raw OCR Inspector Modal */}
      {inspectReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <span className="text-sm font-bold truncate max-w-md">{inspectReport.filename} (OCR Raw Extract)</span>
              </div>
              <button
                onClick={() => setInspectReport(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded-md"
              >
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 bg-slate-50 whitespace-pre-wrap leading-relaxed">
              {inspectReport.ocr_text || 'No text extracted.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};