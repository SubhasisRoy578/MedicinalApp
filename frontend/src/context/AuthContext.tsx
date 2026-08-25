import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { authApi } from '../api/auth';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPatient: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  quickDemoLogin: (role: 'patient' | 'doctor' | 'admin') => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('arogya_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('arogya_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('arogya_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('arogya_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const handleAuthSuccess = (res: AuthResponse) => {
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('arogya_token', res.access_token);
    localStorage.setItem('arogya_user', JSON.stringify(res.user));
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await authApi.login(email, password);
      handleAuthSuccess(res);
      success(`Welcome back, ${res.user.name}!`);
      return res.user;
    } catch (err: any) {
      error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData: any): Promise<User> => {
    try {
      const res = await authApi.register(userData);
      handleAuthSuccess(res);
      success(`Account created successfully. Welcome, ${res.user.name}!`);
      return res.user;
    } catch (err: any) {
      error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('arogya_token');
    localStorage.removeItem('arogya_user');
    success('Logged out successfully.');
  };

  const quickDemoLogin = async (role: 'patient' | 'doctor' | 'admin'): Promise<User> => {
    let email = 'patient@medikiosk.com';
    let password = 'Patient@123';

    if (role === 'doctor') {
      email = 'doctor@medikiosk.com';
      password = 'Doctor@123';
    } else if (role === 'admin') {
      email = 'admin@medikiosk.com';
      password = 'Admin@123';
    }

    return login(email, password);
  };

  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isPatient,
        isDoctor,
        isAdmin,
        login,
        register,
        logout,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
