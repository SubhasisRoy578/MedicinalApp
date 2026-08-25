import { apiFetch } from './client';
import { User, Consultation } from '../types';

export const doctorApi = {
  getDashboardStats: async (): Promise<{
    today_consultations: number;
    pending_reviews: number;
    in_progress: number;
    verified_consultations: number;
    completed_consultations: number;
    total_patients: number;
  }> => {
    return apiFetch('/doctors/dashboard-stats');
  },

  getConsultations: async (params?: { status?: string; search?: string }): Promise<Consultation[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<Consultation[]>(`/doctors/consultations${qs}`);
  },

  getPatients: async (search?: string): Promise<User[]> => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiFetch<User[]>(`/doctors/patients${qs}`);
  },

  getPatientDetail: async (patientId: number): Promise<{
    patient: User;
    consultations: Consultation[];
  }> => {
    return apiFetch(`/doctors/patients/${patientId}`);
  },

  getTriageAlerts: async (): Promise<any[]> => {
    return apiFetch<any[]>('/triage/alerts');
  },

  acknowledgeTriageAlert: async (id: number): Promise<any> => {
    return apiFetch<any>(`/triage/alerts/${id}/acknowledge`, { method: 'POST' });
  },

  getAllDoctors: async (): Promise<User[]> => {
    return apiFetch<User[]>('/doctors');
  }
};
