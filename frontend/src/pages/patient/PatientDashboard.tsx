import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { consultationsApi } from '../../api/consultations';
import { doctorApi } from '../../api/doctor';
import { Consultation, ConsultationMode } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Activity,
  PlusCircle,
  Clock,
  FileText,
  ChevronRight,
  Sparkles,
  Calendar,
  User,
  HeartPulse,
  PhoneCall,
  RefreshCw,
  Leaf,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [emergencyDoctor, setEmergencyDoctor] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModePicker, setShowModePicker] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { error } = useToast();
  const navigate = useNavigate();

  const fetchConsultations = async () => {
    try {
      setIsLoading(true);
      const data = await consultationsApi.getAll();
      setConsultations(data);

      // Prefer the doctor assigned to the patient's latest consultation.
      const assignedDoctorId = data.find((c) => c.doctor_id)?.doctor_id;
      const doctors = await doctorApi.getAllDoctors();
      const doctor = assignedDoctorId
        ? doctors.find((d) => d.id === assignedDoctorId) || doctors[0]
        : doctors[0];
      setEmergencyDoctor(doctor || null);
    } catch (err: any) {
      error(err.message || 'Failed to fetch consultations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleStartNew = () => setShowModePicker(true);

  const startConsultation = async (mode: ConsultationMode) => {
    try {
      setIsStarting(true);
      const newCons = await consultationsApi.create({
        language: user?.patient_profile?.preferred_language || 'English',
        mode,
      });
      setShowModePicker(false);
      navigate(`/patient/consultation/${newCons.id}`);
    } catch (err: any) {
      error(err.message || 'Could not start new consultation');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      {showModePicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">Consultation Type</p>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Choose your clinical intake</h2>
                <p className="text-xs text-slate-500 mt-2">Select the workflow that matches the OPD you are visiting.</p>
              </div>
              <button onClick={() => setShowModePicker(false)} className="p-2 rounded-xl hover:bg-slate-100" aria-label="Close">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-6">
              <button
                disabled={isStarting}
                onClick={() => startConsultation('GENERAL')}
                className="text-left p-6 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">General Medical OPD</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Standard medical history, symptoms, medicines, allergies, previous illnesses and reports.
                </p>
              </button>
              <button
                disabled={isStarting}
                onClick={() => startConsultation('AYUSH')}
                className="text-left p-6 rounded-2xl border-2 border-amber-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">AYUSH OPD</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Adds documentation questions for Prakriti, Vikriti, Agni, Koshtha, Ahara and Vihara.
                </p>
              </button>
            </div>
            <div className="px-6 pb-6">
              <p className="text-[11px] text-slate-400">AYUSH answers are recorded as patient-reported or previously documented information for practitioner review.</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Patient Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
              Patient Portal
            </span>
            <span className="text-xs text-teal-300">
              Language: {user?.patient_profile?.preferred_language || 'English'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl leading-relaxed">
            Prepare your medical history summary before seeing your doctor. Answer simple guided questions and upload previous diagnostic reports.
          </p>
        </div>

        <button
          onClick={handleStartNew}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-teal-400/20 active:scale-95 flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Start New Consultation</span>
        </button>
      </div>

      {/* Overview Cards */}
      {/* Emergency Doctor Contact */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Emergency Medical Assistance</p>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Need urgent help? Contact your doctor
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {emergencyDoctor
                  ? `${emergencyDoctor.name}${emergencyDoctor.doctor_profile?.specialization ? ` • ${emergencyDoctor.doctor_profile.specialization}` : ''}`
                  : 'No doctor contact is currently configured.'}
              </p>
              {emergencyDoctor?.phone && (
                <p className="text-sm font-black text-slate-900 mt-1">{emergencyDoctor.phone}</p>
              )}
            </div>
          </div>

          {emergencyDoctor?.phone ? (
            <a
              href={`tel:${emergencyDoctor.phone.replace(/[^+\d]/g, '')}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/20 transition-all active:scale-95"
              aria-label={`Call ${emergencyDoctor.name}`}
            >
              <PhoneCall className="w-4 h-4" />
              Call Doctor
            </a>
          ) : (
            <span className="text-xs font-bold text-red-700 bg-white/70 px-3 py-2 rounded-xl border border-red-200">
              Contact unavailable
            </span>
          )}
        </div>
        <p className="text-[10px] text-red-700/80 mt-3">
          For a life-threatening emergency, contact your local emergency medical service immediately. This button connects to the doctor contact configured in MediKiosk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Start Interview Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-teal-400 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Guided AI Interview</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start an adaptive, multilingual health interview with voice recording and quick select choices.
            </p>
          </div>
          <button
            onClick={handleStartNew}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 self-start pt-2"
          >
            <span>Begin Intake Questionnaire</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Patient Profile Snapshot */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-400">PATIENT PROFILE</span>
          </div>
          <div className="text-xs text-slate-600 space-y-1.5 pt-1">
            <div><strong>Blood Group:</strong> {user?.patient_profile?.blood_group || 'B+'}</div>
            <div><strong>Gender / DOB:</strong> {user?.patient_profile?.gender || 'Male'} ({user?.patient_profile?.date_of_birth || '1984-06-15'})</div>
            <div><strong>Contact Phone:</strong> {user?.phone || '+91 9822334455'}</div>
          </div>
        </div>

        {/* AI & Clinical Safety Info */}
        <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-800">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Clinical Safety Note</h3>
          </div>
          <p className="text-xs text-teal-900 leading-relaxed">
            AI organizes and formats your medical records for doctor review. All medical diagnoses and prescriptions will be made directly by your attending physician.
          </p>
        </div>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Your Consultations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track your clinical intake and doctor review status</p>
          </div>
          <button
            onClick={fetchConsultations}
            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {consultations.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Consultations Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't started any health consultations yet. Click the button below to start your first guided AI interview.
            </p>
            <button
              onClick={handleStartNew}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
            >
              Start Consultation
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {consultations.map((cons) => (
              <div
                key={cons.id}
                className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-900">
                      Consultation #{cons.id}
                    </span>
                    <StatusBadge status={cons.status} />
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {cons.language}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(cons.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      {cons.reports_count || 0} Reports Attached
                    </span>
                    {cons.doctor && (
                      <>
                        <span>•</span>
                        <span>Doctor: {cons.doctor.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <Link
                  to={`/patient/consultation/${cons.id}`}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 transition-colors self-start sm:self-auto"
                >
                  <span>
                    {cons.status === 'CREATED'
                      ? 'Begin Intake →'
                      : cons.status === 'IN_PROGRESS'
                      ? 'Continue Intake →'
                      : 'View Summary & Status →'}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
