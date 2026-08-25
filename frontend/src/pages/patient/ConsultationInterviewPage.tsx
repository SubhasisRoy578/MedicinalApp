import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationsApi } from '../../api/consultations';
import { reportsApi } from '../../api/reports';
import { Consultation, Question, Answer, MedicalReport, MedicalSummary } from '../../types';
import { ConsentCard } from '../../components/patient/ConsentCard';
import { LanguageSelector } from '../../components/patient/LanguageSelector';
import { VoiceAnswerInput } from '../../components/patient/VoiceAnswerInput';
import { ReportUploader } from '../../components/patient/ReportUploader';
import { SummaryReview } from '../../components/patient/SummaryReview';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Bot,
  User,
  FileText,
  Clock,
  ShieldCheck,
  Stethoscope,
  RefreshCw,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

type ConsultationStep = 'CONSENT' | 'LANGUAGE' | 'INTERVIEW' | 'REPORTS' | 'SUMMARY_REVIEW' | 'SUBMITTED' | 'TRIAGE';

export const ConsultationInterviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const consultationId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [currentStep, setCurrentStep] = useState<ConsultationStep>('CONSENT');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [answersList, setAnswersList] = useState<Answer[]>([]);
  const [reportsList, setReportsList] = useState<MedicalReport[]>([]);
  const [summary, setSummary] = useState<MedicalSummary | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [triageAlert, setTriageAlert] = useState<any | null>(null);

  const fetchConsultationData = async () => {
    if (!consultationId) return;
    try {
      setIsLoading(true);
      const cons = await consultationsApi.getById(consultationId);
      setConsultation(cons);
      setSelectedLanguage(cons.language || 'English');
      setReportsList(cons.reports || []);
      setAnswersList(cons.answers || []);

      if (cons.summary) {
        setSummary(cons.summary);
      }

      // Determine appropriate starting step based on consultation state
      if (!cons.consent_given) {
        setCurrentStep('CONSENT');
      } else if (cons.status === 'WAITING_FOR_DOCTOR' || cons.status === 'VERIFIED' || cons.status === 'COMPLETED') {
        setCurrentStep('SUBMITTED');
      } else if (cons.summary && cons.summary_status === 'READY') {
        setCurrentStep('SUMMARY_REVIEW');
      } else {
        // In Progress Questionnaire
        setCurrentStep('INTERVIEW');
        await loadNextQuestion();
      }
    } catch (err: any) {
      error(err.message || 'Failed to load consultation');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextQuestion = async () => {
    try {
      const qData = await consultationsApi.getNextQuestion(consultationId);
      setProgress(qData.progress_percentage);
      if (qData.next_question) {
        setCurrentQuestion(qData.next_question);
      } else {
        // Questionnaire finished, proceed to report upload step
        setCurrentQuestion(null);
        setCurrentStep('REPORTS');
        info('Questionnaire completed! You may now attach any medical reports or generate your summary.');
      }
    } catch (err: any) {
      console.warn('Error loading next question:', err);
    }
  };

  useEffect(() => {
    fetchConsultationData();
  }, [consultationId]);

  // Step 1: Consent submitted
  const handleConsent = async () => {
    try {
      setIsSubmitting(true);
      await consultationsApi.submitConsent(consultationId, {
        consent_given: true,
        language: selectedLanguage,
      });
      setCurrentStep('LANGUAGE');
      success('Consent recorded.');
    } catch (err: any) {
      error(err.message || 'Failed to save consent');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Language selected
  const handleLanguageContinue = async () => {
    try {
      setIsSubmitting(true);
      await consultationsApi.submitConsent(consultationId, {
        consent_given: true,
        language: selectedLanguage,
      });
      setCurrentStep('INTERVIEW');
      await loadNextQuestion();
    } catch (err: any) {
      error(err.message || 'Failed to set language');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Answer Question
  const handleAnswerSubmit = async (answerText: string, answerType: 'text' | 'voice' | 'quick_button') => {
    if (!currentQuestion) return;

    try {
      setIsSubmitting(true);
      const newAnswer = await consultationsApi.submitAnswer(consultationId, {
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        category: currentQuestion.category,
        answer: answerText,
        answer_type: answerType,
      });

      setAnswersList((prev) => [...prev, newAnswer]);

      // Check immediately after every answer. The backend creates the alert
      // when a red-flag combination is detected.
      const triageAlerts = await consultationsApi.getTriageStatus(consultationId);
      const activeAlert = triageAlerts.find((alert: any) => alert.status === 'ACTIVE');

      if (activeAlert) {
        setTriageAlert(activeAlert);
        setCurrentStep('TRIAGE');
        error('Urgent safety alert created. Please notify hospital triage staff immediately.');
        return;
      }

      success('Answer recorded.');
      await loadNextQuestion();
    } catch (err: any) {
      error(err.message || 'Failed to save answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 4: Generate Summary
  const handleGenerateSummary = async () => {
    try {
      setIsSubmitting(true);
      const generated = await consultationsApi.generateSummary(consultationId);
      setSummary(generated);
      setCurrentStep('SUMMARY_REVIEW');
      success('AI Medical History Summary generated successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to generate medical summary');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 5: Submit to Doctor
  const handleSubmitToDoctor = async () => {
    try {
      setIsSubmitting(true);
      const updated = await consultationsApi.submitToDoctor(consultationId);
      setConsultation(updated);
      setCurrentStep('SUBMITTED');
      success('Your medical history has been submitted to the doctor queue!');
    } catch (err: any) {
      error(err.message || 'Failed to submit to doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading consultation workspace...</p>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">Consultation record not found.</p>
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="px-4 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate('/patient/dashboard')}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">Consultation #{consultation.id}</span>
          <StatusBadge status={consultation.status} />
        </div>
      </div>

      {/* Workflow Step Progress Navigator */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span className="flex items-center gap-1.5 text-teal-800">
            <Sparkles className="w-4 h-4 text-teal-600" />
            {currentStep === 'CONSENT' && 'Step 1: Clinical Consent'}
            {currentStep === 'LANGUAGE' && 'Step 2: Language Preference'}
            {currentStep === 'INTERVIEW' && `Step 3: Adaptive AI Interview (${progress}% Complete)`}
            {currentStep === 'REPORTS' && 'Step 4: Diagnostic Reports & OCR'}
            {currentStep === 'SUMMARY_REVIEW' && 'Step 5: Review & Submit to Doctor'}
            {currentStep === 'SUBMITTED' && 'Step 6: Clinical Doctor Review'}
            {currentStep === 'TRIAGE' && 'Urgent Triage Escalation'}
          </span>
          <span className="text-slate-400">Language: {selectedLanguage}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{
              width:
                currentStep === 'CONSENT'
                  ? '15%'
                  : currentStep === 'LANGUAGE'
                  ? '30%'
                  : currentStep === 'INTERVIEW'
                  ? `${Math.max(30, progress)}%`
                  : currentStep === 'REPORTS'
                  ? '80%'
                  : '100%',
            }}
          />
        </div>
      </div>

      {currentStep === 'TRIAGE' && triageAlert && (
        <div className="rounded-3xl border-2 border-rose-300 bg-rose-50 p-7 shadow-xl shadow-rose-500/10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-rose-700">Urgent triage escalation</div>
              <h2 className="text-2xl font-black text-rose-950 mt-2">Please notify hospital triage staff immediately</h2>
              <p className="text-sm text-rose-900 mt-3 leading-relaxed">
                Your answers contain symptoms that require prompt assessment by trained healthcare staff.
                The AI is not diagnosing you.
              </p>
            </div>
            <div className="text-left bg-white/80 border border-rose-200 rounded-2xl p-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-rose-700">Why this was escalated</div>
              <p className="text-sm font-semibold text-slate-900 mt-1">{triageAlert.reason}</p>
            </div>
            <div className="text-xs font-semibold text-rose-800">
              Triage alert #{triageAlert.id} has been placed in the hospital's clinical triage queue.
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: CONSENT */}
      {currentStep === 'CONSENT' && (
        <ConsentCard
          onConsentGiven={handleConsent}
          onCancel={() => navigate('/patient/dashboard')}
          isLoading={isSubmitting}
        />
      )}

      {/* STEP 2: LANGUAGE SELECTION */}
      {currentStep === 'LANGUAGE' && (
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          onContinue={handleLanguageContinue}
          isLoading={isSubmitting}
        />
      )}

      {/* STEP 3: ADAPTIVE AI INTERVIEW */}
      {currentStep === 'INTERVIEW' && (
        <div className="space-y-6 animate-slide-up">
          {/* Active Question Card */}
          {currentQuestion && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Question Category & Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300">
                      Category: {currentQuestion.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">AI Medical Health Interviewer</h3>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Question #{currentQuestion.id}
                </span>
              </div>

              {/* Chat question box */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-slate-900 text-base font-semibold leading-relaxed shadow-xs">
                  "{currentQuestion.question_text}"
                </div>

                {/* Voice / Text / Buttons Input Component */}
                <VoiceAnswerInput
                  question={currentQuestion}
                  language={selectedLanguage}
                  onSubmit={handleAnswerSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Quick Skip to Reports if patient already finished key questions */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Answered {answersList.length} question(s)</span>
            <button
              type="button"
              onClick={() => setCurrentStep('REPORTS')}
              className="text-teal-600 font-bold hover:underline"
            >
              Done answering? Proceed to upload medical reports →
            </button>
          </div>

          {/* Previous Answers History Log */}
          {answersList.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Recorded Interview Responses ({answersList.length})
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {answersList.map((ans, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="font-bold text-slate-700 flex items-center justify-between">
                      <span>{ans.question_text}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{ans.answer_type}</span>
                    </div>
                    <div className="text-teal-900 font-medium">{ans.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: MEDICAL REPORTS & OCR */}
      {currentStep === 'REPORTS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">Upload Previous Medical Reports</h2>
            <p className="text-xs text-slate-500 mt-1">
              Upload past doctor prescriptions, clinical blood panels, ECGs, or discharge summaries for automated OCR extraction.
            </p>
          </div>

          <ReportUploader
            consultationId={consultationId}
            reports={reportsList}
            onReportsUpdated={async () => {
              const reps = await reportsApi.getAll(consultationId);
              setReportsList(reps);
            }}
            onContinue={handleGenerateSummary}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* STEP 5: SUMMARY REVIEW BEFORE DOCTOR */}
      {currentStep === 'SUMMARY_REVIEW' && summary && (
        <SummaryReview
          consultation={consultation}
          summary={summary}
          onSubmitToDoctor={handleSubmitToDoctor}
          isSubmitting={isSubmitting}
        />
      )}

      {/* STEP 6: SUBMITTED STATE / WAITING FOR DOCTOR */}
      {currentStep === 'SUBMITTED' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-slide-up">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
            {consultation.status === 'VERIFIED' || consultation.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            ) : (
              <Clock className="w-9 h-9 text-amber-500" />
            )}
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-block">
              <StatusBadge status={consultation.status} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {consultation.status === 'COMPLETED'
                ? 'Consultation Completed'
                : consultation.status === 'VERIFIED'
                ? 'Medical History Verified by Doctor'
                : 'Medical History Sent to Doctor'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {consultation.status === 'COMPLETED'
                ? 'Your doctor has finalized your clinical consultation notes and prescription.'
                : consultation.status === 'VERIFIED'
                ? 'Your attending physician has reviewed and medically verified your history summary.'
                : 'Your structured medical summary and uploaded diagnostic reports are waiting in the clinical review queue.'}
            </p>
          </div>

          {/* If verified or completed, show doctor notes snippet */}
          {summary && (summary.doctor_notes || summary.prescription_plan || summary.provisional_diagnosis) && (
            <div className="text-left bg-teal-50/50 p-6 rounded-2xl border border-teal-200 space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 border-b border-teal-100 pb-2">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                  Doctor Clinical Assessment & Prescription
                </h3>
              </div>

              {summary.provisional_diagnosis && (
                <div className="text-xs">
                  <strong>Clinical Diagnosis:</strong>{' '}
                  <span className="font-semibold text-slate-900">{summary.provisional_diagnosis}</span>
                </div>
              )}

              {summary.physical_examination && (
                <div className="text-xs">
                  <strong>Examination Findings:</strong>{' '}
                  <span className="text-slate-700">{summary.physical_examination}</span>
                </div>
              )}

              {summary.prescription_plan && (
                <div className="text-xs">
                  <strong>Prescription (Rx) & Advice:</strong>
                  <div className="mt-1 p-3 bg-white rounded-xl border border-teal-200 font-mono text-slate-800 whitespace-pre-line">
                    {summary.prescription_plan}
                  </div>
                </div>
              )}

              {summary.doctor_notes && (
                <div className="text-xs text-slate-600">
                  <strong>Doctor Notes:</strong> {summary.doctor_notes}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchConsultationData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
