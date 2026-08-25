import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorApi } from '../../api/doctor';
import { User, Consultation } from '../../types';
import { Search, User as UserIcon, Calendar, Phone, Mail, FileText, ChevronRight, RefreshCw, ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DoctorPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<{
    patient: User;
    consultations: Consultation[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error } = useToast();

  const fetchPatients = async (query?: string) => {
    try {
      setIsLoading(true);
      const data = await doctorApi.getPatients(query);
      setPatients(data);
    } catch (err: any) {
      error(err.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  const handleSelectPatient = async (patientId: number) => {
    try {
      const data = await doctorApi.getPatientDetail(patientId);
      setSelectedPatientDetail(data);
    } catch (err: any) {
      error(err.message || 'Failed to load patient history');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Directory & Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable clinical patient registry with historical consultation logs
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full pl-10 pr-4 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients List */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Patients ({patients.length})
            </span>
            <button
              onClick={() => fetchPatients(searchTerm)}
              className="p-1 text-slate-400 hover:text-teal-600 rounded"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto pr-1">
            {patients.map((p) => {
              const isSelected = selectedPatientDetail?.patient.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPatient(p.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all my-1 ${
                    isSelected
                      ? 'bg-teal-50 border border-teal-200'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-xs flex-shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{p.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {p.patient_profile?.gender || 'Patient'} • Blood: {p.patient_profile?.blood_group || 'N/A'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Patient Medical History Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatientDetail ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
              {/* Patient Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                    {selectedPatientDetail.patient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{selectedPatientDetail.patient.name}</h2>
                    <p className="text-xs text-slate-500">
                      DOB: {selectedPatientDetail.patient.patient_profile?.date_of_birth || 'Not recorded'} • Gender: {selectedPatientDetail.patient.patient_profile?.gender || 'Unspecified'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                    Blood: {selectedPatientDetail.patient.patient_profile?.blood_group || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Patient Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Contact Information</div>
                  <div>Email: {selectedPatientDetail.patient.email}</div>
                  <div>Phone: {selectedPatientDetail.patient.phone || 'None provided'}</div>
                  <div>Emergency: {selectedPatientDetail.patient.patient_profile?.emergency_contact || 'None'}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Preferences & Address</div>
                  <div>Preferred Language: {selectedPatientDetail.patient.patient_profile?.preferred_language || 'English'}</div>
                  <div>Address: {selectedPatientDetail.patient.patient_profile?.address || 'On file'}</div>
                </div>
              </div>

              {/* Consultation History */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Past Consultations ({selectedPatientDetail.consultations.length})
                </h3>

                {selectedPatientDetail.consultations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    No consultations recorded for this patient.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedPatientDetail.consultations.map((cons) => (
                      <div
                        key={cons.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              Consultation #{cons.id}
                            </span>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                              {cons.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(cons.created_at).toLocaleDateString(undefined, {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })} • Language: {cons.language}
                          </div>
                        </div>

                        <Link
                          to={`/doctor/consultations/${cons.id}/review`}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold transition-colors"
                        >
                          Open Review Studio →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-2">
              <UserIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p>Select a patient from the directory to view complete clinical history and records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
