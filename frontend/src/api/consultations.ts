import { apiFetch } from './client';
import { Consultation, Answer, Question, MedicalSummary, AuditLog, ConsultationMode } from '../types';

export const consultationsApi = {
  create: async (data: { language?: string; doctor_id?: number; mode?: ConsultationMode }): Promise<Consultation> => {
    return apiFetch<Consultation>('/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (): Promise<Consultation[]> => {
    return apiFetch<Consultation[]>('/consultations');
  },

  getById: async (id: number): Promise<Consultation> => {
    return apiFetch<Consultation>(`/consultations/${id}`);
  },

  submitConsent: async (id: number, data: { consent_given: boolean; language?: string }): Promise<Consultation> => {
    return apiFetch<Consultation>(`/consultations/${id}/consent`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submitToDoctor: async (id: number): Promise<Consultation> => {
    return apiFetch<Consultation>(`/consultations/${id}/submit-to-doctor`, {
      method: 'POST',
    });
  },

  // Questionnaire
  getQuestions: async (id: number): Promise<Question[]> => {
    return apiFetch<Question[]>(`/consultations/${id}/questionnaire/questions`);
  },

  getNextQuestion: async (id: number): Promise<{
    consultation_id: number;
    language: string;
    progress_percentage: number;
    answered_count: number;
    next_question: Question | null;
    is_complete: boolean;
  }> => {
    return apiFetch(`/consultations/${id}/questionnaire/next-question`);
  },

  submitAnswer: async (id: number, answer: Answer): Promise<Answer> => {
    return apiFetch<Answer>(`/consultations/${id}/questionnaire/answers`, {
      method: 'POST',
      body: JSON.stringify(answer),
    });
  },

  getAnswers: async (id: number): Promise<Answer[]> => {
    return apiFetch<Answer[]>(`/consultations/${id}/questionnaire/answers`);
  },

  // Triage safety alerts
  getTriageStatus: async (id: number): Promise<any[]> => {
    return apiFetch<any[]>(`/triage/consultations/${id}/status`);
  },

  // Medical Summary
  generateSummary: async (id: number): Promise<MedicalSummary> => {
    return apiFetch<MedicalSummary>(`/consultations/${id}/summary/generate`, {
      method: 'POST',
    });
  },

  getSummary: async (id: number): Promise<MedicalSummary> => {
    return apiFetch<MedicalSummary>(`/consultations/${id}/summary`);
  },

  updateSummary: async (id: number, summaryData: Partial<MedicalSummary>): Promise<MedicalSummary> => {
    return apiFetch<MedicalSummary>(`/consultations/${id}/summary`, {
      method: 'PUT',
      body: JSON.stringify(summaryData),
    });
  },

  // Verification & Notes
  verifyConsultation: async (id: number, data?: any): Promise<Consultation> => {
    return apiFetch<Consultation>(`/consultations/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  completeConsultation: async (id: number): Promise<Consultation> => {
    return apiFetch<Consultation>(`/consultations/${id}/complete`, {
      method: 'POST',
    });
  },

  saveDoctorNotes: async (id: number, notesData: any): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/consultations/${id}/doctor-notes`, {
      method: 'POST',
      body: JSON.stringify(notesData),
    });
  },

  getAuditLogs: async (id: number): Promise<AuditLog[]> => {
    return apiFetch<AuditLog[]>(`/consultations/${id}/audit-logs`);
  },
};
