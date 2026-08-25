import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, User, Stethoscope, Shield, Sparkles, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      const user = await login(email, password);
      if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'patient' | 'doctor' | 'admin') => {
    try {
      setIsSubmitting(true);
      const user = await quickDemoLogin(role);
      if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Sign In to MediKiosk</h2>
          <p className="text-xs text-teal-100 mt-1">
            {activeTab === 'patient' ? 'Patient Portal & Consultation Intake' : 'Clinical Physician Portal'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1 m-4 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'patient'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Patient Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'doctor'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Login
          </button>
        </div>

        <div className="p-6 pt-2 space-y-5">
          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={activeTab === 'patient' ? 'patient@medikiosk.com' : 'doctor@medikiosk.com'}
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-slate-900 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Container */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Fast Demo Logins (No Typing)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                disabled={isSubmitting}
                className="p-2 text-xs font-bold rounded-xl bg-teal-50 border border-teal-200 text-teal-900 hover:bg-teal-100 transition-colors text-center"
              >
                👤 Demo Patient
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                disabled={isSubmitting}
                className="p-2 text-xs font-bold rounded-xl bg-blue-50 border border-blue-200 text-blue-900 hover:bg-blue-100 transition-colors text-center"
              >
                🩺 Demo Doctor
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={isSubmitting}
              className="w-full p-2 text-xs font-bold rounded-xl bg-purple-50 border border-purple-200 text-purple-900 hover:bg-purple-100 transition-colors text-center"
            >
              🛡️ Demo Administrator
            </button>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:underline">
              Create a Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
