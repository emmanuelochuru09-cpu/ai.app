import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SystemConfig } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../api';

interface AuthContextType {
  user: User | null;
  plansConfig: SystemConfig['plans'] | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; pass: string; fullName: string; businessName: string; businessType: string; currency: 'NGN' | 'USD' }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserInState: (updated: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [plansConfig, setPlansConfig] = useState<SystemConfig['plans'] | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      if (data.plansConfig) {
        setPlansConfig(data.plansConfig as any);
      }
    } catch (err) {
      console.warn('Session expired or invalid, logging out.');
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { email: string; pass: string; fullName: string; businessName: string; businessType: string; currency: 'NGN' | 'USD' }) => {
    const res = await api.register({
      email: data.email,
      password: data.pass,
      fullName: data.fullName,
      businessName: data.businessName,
      businessType: data.businessType,
      currency: data.currency,
    });
    setAuthToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const updateUserInState = (updated: User) => {
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        plansConfig,
        loading,
        login,
        register,
        logout,
        refreshUser,
        updateUserInState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
