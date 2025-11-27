// hooks/admin/useAdminAuth.ts
'use client';

import { useState, useEffect } from 'react';

const LS_ADMIN_TOKEN = "skatershop-admin-token"; // Tu constante exacta

interface UseAdminAuthReturn {
  isLogged: boolean;
  loading: boolean;
  logout: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  user: any | null;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem(LS_ADMIN_TOKEN);
        const userData = localStorage.getItem('admin_user');
        
        if (token && userData) {
          setIsLogged(true);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLogged(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem(LS_ADMIN_TOKEN, result.data.token); // Tu constante
        localStorage.setItem('admin_user', JSON.stringify(result.data.user));
        setIsLogged(true);
        setUser(result.data.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = () => {
    localStorage.removeItem(LS_ADMIN_TOKEN); // Tu constante
    localStorage.removeItem('admin_user');
    setIsLogged(false);
    setUser(null);
    window.location.href = '/admin/login';
  };

  return {
    isLogged,
    loading,
    user,
    login,
    logout
  };
};