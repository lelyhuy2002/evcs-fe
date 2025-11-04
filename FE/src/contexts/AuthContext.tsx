'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkLoginStatus, logout as apiLogout } from '@/lib/api';

interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  verificationStatus: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  const checkAuth = async () => {
    try {
      const response = await checkLoginStatus();
      if (response.success && response.data.isAuthenticated) {
        setUser({
          userId: response.data.userId!,
          email: response.data.email!,
          fullName: '', // Will be populated when needed
          role: response.data.role!,
          verificationStatus: '',
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
