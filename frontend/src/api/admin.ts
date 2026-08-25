import { apiFetch } from './client';
import { User, AdminStats, AuditLog } from '../types';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiFetch<AdminStats>('/admin/stats');
  },

  getUsers: async (): Promise<User[]> => {
    return apiFetch<User[]>('/admin/users');
  },

  toggleUserStatus: async (userId: number): Promise<{ message: string; is_active: boolean }> => {
    return apiFetch<{ message: string; is_active: boolean }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
    });
  },

  getAllAuditLogs: async (limit: number = 100): Promise<AuditLog[]> => {
    return apiFetch<AuditLog[]>(`/audit/logs?limit=${limit}`);
  },
};
