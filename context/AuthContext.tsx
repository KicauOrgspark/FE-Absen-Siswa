"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/api/auth";
import { User, LoginCredentials, LoginResponse } from "@/types/auth.types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
  submitAbsen: (tokenCode: string) => Promise<{ message: string; status: string }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 🔥 CHECK AUTH SAAT LOAD APP
  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await authAPI.getCurrentUser();
      if (currentUser) setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 🔥 LOGIN → HANYA SIMPAN TOKEN
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const result = await authAPI.login(credentials);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const submitAbsen = useCallback(async (tokenCode: string) => {
    return authAPI.submitAbsenToken(tokenCode);
  }, []);

  const value = useMemo(
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};