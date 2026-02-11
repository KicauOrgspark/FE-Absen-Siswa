import { LoginCredentials, LoginResponse, User } from '@/types/auth.types';

const API_BASE_URL = 'https://www.reihan.biz.id/api/v1';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();
    
    // Store the access token
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
    }
    
    return data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token might be invalid or expired
      localStorage.removeItem('authToken');
      return null;
    }

    const data: User = await response.json();
    return data;
  },

  submitAbsenToken: async (tokenCode: string): Promise<{ message: string; status: string }> => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/token/absen`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token_code: tokenCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit attendance');
    }

    return response.json();
  },

  logout: (): void => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};