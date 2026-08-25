import { apiFetch, API_BASE } from './client';
import { MedicalReport } from '../types';

export const reportsApi = {
  upload: async (consultationId: number, file: File): Promise<MedicalReport> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<MedicalReport>(`/consultations/${consultationId}/reports/upload`, {
      method: 'POST',
      body: formData,
    });
  },

  getAll: async (consultationId: number): Promise<MedicalReport[]> => {
    return apiFetch<MedicalReport[]>(`/consultations/${consultationId}/reports`);
  },

  rerunOcr: async (reportId: number): Promise<MedicalReport> => {
    return apiFetch<MedicalReport>(`/reports/${reportId}/ocr`, {
      method: 'POST',
    });
  },

  delete: async (reportId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  },

  getFileUrl: (reportId: number): string => {
    const token = localStorage.getItem('arogya_token');
    return `${API_BASE}/reports/${reportId}/file?token=${token || ''}`;
  }
};
