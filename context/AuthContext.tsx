'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/api/auth';
import { User, LoginCredentials } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  submitAbsen: (tokenCode: string) => Promise<{ message: string; status: string }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get current user
      const currentUser = await authAPI.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      // Login and get token
      await authAPI.login(credentials);
      
      // Fetch user data with the token
      const userData = await authAPI.getCurrentUser();
      
      if (userData) {
        setUser(userData);
        // Redirect to main page after successful login
        router.push('/'); // Change to wherever you want students to land
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw so login form can show error
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    router.push('/login');
  }, [router]);

  const submitAbsen = useCallback(async (tokenCode: string) => {
    try {
      const result = await authAPI.submitAbsenToken(tokenCode);
      return result;
    } catch (error) {
      console.error('Absen submission error:', error);
      throw error;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      submitAbsen,
    }),
    [user, isLoading, login, logout, submitAbsen]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};