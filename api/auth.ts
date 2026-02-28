// src/api/auth.ts
import { LoginCredentials, LoginResponse, User } from "@/types/auth.types";

const API_BASE_URL = "http://127.0.0.1:3000/api/v1";

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);

    // 🔥 AMBIL TOKEN DENGAN AMAN (SUPPORT SEMUA FORMAT)
    const token =
      data.access_token ??
      data.accessToken ??
      data.token ??
      data?.data?.access_token;

    if (!token) {
      throw new Error("Token tidak ditemukan di response backend");
    }

    // 🔥 SIMPAN TOKEN
    localStorage.setItem("authToken", token);

    return {
      message: data.message,
      access_token: token,
      role: data.role,
    };
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem("authToken");
      return null;
    }

    return response.json();
  },

  submitAbsenToken: async (
    tokenCode: string
  ): Promise<{ message: string; status: string }> => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/token/absen`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token_code: tokenCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed submit absen");
    }

    return response.json();
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
};