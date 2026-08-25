import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User as UserIcon,
  LogOut,
  Sparkles,
  Stethoscope,
  Shield,
  FileText,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickDemoLogin, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDemoSwitch = async (role: 'patient' | 'doctor' | 'admin') => {
    setDemoOpen(false);
    setMobileMenuOpen(false);
    await quickDemoLogin(role);
    if (role === 'patient') navigate('/patient/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="gov-top-strip" aria-hidden="true" />
      <div className="gov-utility-bar">
        <div className="gov-utility-inner">
          <span>Public Digital Health Portal</span>
          <span>Accessible • Secure • Patient-Centred</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                MediKiosk
              </span>
              <p className="text-[10px] font-medium text-slate-500 -mt-1 hidden sm:block">Clinical Consultation Assistant</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                {isPatient && (
                  <>
                    <Link to="/patient/dashboard" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                      My Consultations
                    </Link>
                    <Link to="/patient/consultation/new" className="text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 px-3.5 py-1.5 rounded-lg border border-teal-200 transition-colors">
                      + Start Consultation
                    </Link>
                  </>
                )}

                {isDoctor && (
                  <>
                    <Link to="/doctor/dashboard" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                      Clinical Dashboard
                    </Link>
                    <Link to="/doctor/patients" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                      Patient Directory
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link to="/admin/dashboard" className="text-sm font-medium text-slate-600 hover:text-teal-600 transition-colors">
                    Admin Portal
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Items: Demo Switcher + Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Mode Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoOpen(!demoOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-amber-600" />
              </button>

              {demoOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Fast Demo Persona Switch
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('patient')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-semibold">Demo Patient (Rahul)</div>
                      <div className="text-[10px] text-slate-400">Preloaded chest discomfort & reports</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('doctor')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold">Demo Doctor (Dr. Roy)</div>
                      <div className="text-[10px] text-slate-400">Cardiology review studio & notes</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-semibold">System Administrator</div>
                      <div className="text-[10px] text-slate-400">Audit logs & user control</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Profile / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
                  <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wide">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-lg text-slate-700 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                  <div className="text-xs text-teal-600 font-medium">{user?.role}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-xs text-rose-600 font-semibold px-3 py-1 bg-rose-50 rounded-md"
                >
                  Logout
                </button>
              </div>

              {isPatient && (
                <>
                  <Link
                    to="/patient/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 py-2"
                  >
                    My Consultations
                  </Link>
                  <Link
                    to="/patient/consultation/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-teal-600 py-2"
                  >
                    + Start New Consultation
                  </Link>
                </>
              )}

              {isDoctor && (
                <>
                  <Link
                    to="/doctor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 py-2"
                  >
                    Clinical Dashboard
                  </Link>
                  <Link
                    to="/doctor/patients"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-slate-700 py-2"
                  >
                    Patient Directory
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-slate-700 py-2"
                >
                  Admin Portal
                </Link>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold py-2 rounded-lg bg-slate-100 text-slate-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold py-2 rounded-lg bg-teal-600 text-white"
              >
                Register
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 mb-2">QUICK DEMO PERSONAS</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoSwitch('patient')}
                className="text-xs font-semibold py-1.5 px-2 rounded bg-teal-50 text-teal-800 text-center"
              >
                Patient
              </button>
              <button
                onClick={() => handleDemoSwitch('doctor')}
                className="text-xs font-semibold py-1.5 px-2 rounded bg-blue-50 text-blue-800 text-center"
              >
                Doctor
              </button>
              <button
                onClick={() => handleDemoSwitch('admin')}
                className="text-xs font-semibold py-1.5 px-2 rounded bg-purple-50 text-purple-800 text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
