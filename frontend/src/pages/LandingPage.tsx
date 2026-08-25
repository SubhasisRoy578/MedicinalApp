import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  FileText,
  Sparkles,
  Mic,
  Languages,
  CheckCircle2,
  Lock,
  Clock,
  HeartPulse,
  UserCheck,
  ChevronRight,
  Play
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async (role: 'patient' | 'doctor') => {
    await quickDemoLogin(role);
    if (role === 'patient') navigate('/patient/dashboard');
    else navigate('/doctor/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-xs animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Next-Generation Pre-Consultation Clinical Intake</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Better medical history.{' '}
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Smarter consultations.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Let AI prepare your structured medical history before you meet your doctor. Answer simple adaptive questions via voice or text, upload previous medical reports for instant OCR extraction, and give your doctor a clear, verified summary.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-teal-600/25 active:scale-95"
              >
                <span>Start Health Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleLaunchDemo('doctor')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 hover:border-teal-500 text-slate-800 font-bold text-sm hover:bg-slate-50 transition-all shadow-xs"
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Login / Review Studio</span>
              </button>
            </div>

            {/* Fast Demo Persona Buttons */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Instant 1-Click Demo:</span>
              <button
                onClick={() => handleLaunchDemo('patient')}
                className="px-3 py-1 rounded-lg bg-teal-100/70 text-teal-800 font-bold hover:bg-teal-200 transition-colors"
              >
                🚀 Load Patient Demo (Rahul)
              </button>
              <button
                onClick={() => handleLaunchDemo('doctor')}
                className="px-3 py-1 rounded-lg bg-blue-100/70 text-blue-800 font-bold hover:bg-blue-200 transition-colors"
              >
                🩺 Load Doctor Demo (Dr. Roy)
              </button>
            </div>
          </div>

          {/* Clinical Workflow Visual Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-bold text-slate-500">MediKiosk • Adaptive Clinical Intake Studio</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                System Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">1</div>
                <h4 className="text-xs font-bold text-slate-800">Adaptive Voice/Text Intake</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dynamic questioning branches based on pain, duration, medications, and chronic history in EN, HI, or BN.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">2</div>
                <h4 className="text-xs font-bold text-slate-800">Document OCR Extraction</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Automatic entity extraction pulls lab values (FBS, HbA1c, Lipids), prior prescriptions, and hospital discharge summaries.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</div>
                <h4 className="text-xs font-bold text-slate-800">Doctor Verification Studio</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Doctor edits summary fields, adds physical exam notes & prescription, and signs off with cryptographic audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Step-By-Step Patient Journey</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">How MediKiosk Works</h3>
            <p className="text-sm text-slate-500 mt-2">
              From arrival to consultation, information flows seamlessly so physicians can focus on patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Consent & Language',
                desc: 'Patient gives informed clinical consent and chooses preferred language (English, हिन्दी, বাংলা).',
                icon: Languages,
                color: 'text-teal-600 bg-teal-50',
              },
              {
                step: '02',
                title: 'Adaptive AI Interview',
                desc: 'AI asks contextual medical questions answered by voice recording, quick buttons, or typing.',
                icon: Mic,
                color: 'text-blue-600 bg-blue-50',
              },
              {
                step: '03',
                title: 'Report OCR Parsing',
                desc: 'Upload past prescriptions & lab PDFs. Built-in OCR extracts lab values, diagnoses, and medicines.',
                icon: FileText,
                color: 'text-purple-600 bg-purple-50',
              },
              {
                step: '04',
                title: 'Physician Verification',
                desc: 'Doctor reviews the AI summary, edits fields, conducts exam, writes treatment plan, and verifies.',
                icon: UserCheck,
                color: 'text-emerald-600 bg-emerald-50',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-lg transition-all duration-300 relative group"
              >
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-wider mb-4">
                  STAGE {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Benefits Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Clinical Value</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Why Hospitals & Doctors Trust Us</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">70% Less Documentation Burden</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors save 8-12 minutes per patient on routine typing and can dedicate more time to clinical examination and compassionate conversation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Strict Non-Diagnostic Safety</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The AI does not diagnose or prescribe. It acts purely as a structured clinical scribe and organizer, leaving all medical authority with the doctor.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Clear Data Provenance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual tags clearly separate patient-reported symptoms, OCR lab extractions, and physician verified entries for complete medical transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">Experience MediKiosk Today</h2>
          <p className="text-sm text-teal-100 max-w-xl mx-auto leading-relaxed">
            Join modern clinics delivering superior patient satisfaction and streamlined consultation workflows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-teal-900 font-extrabold text-xs hover:bg-teal-50 shadow-lg shadow-teal-900/40 transition-all active:scale-95"
            >
              Start Free Consultation Intake →
            </Link>
            <button
              onClick={() => handleLaunchDemo('patient')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600/40 border border-teal-400/40 text-white font-bold text-xs hover:bg-teal-600/60 transition-colors"
            >
              Explore Sample Consultation (Demo)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
