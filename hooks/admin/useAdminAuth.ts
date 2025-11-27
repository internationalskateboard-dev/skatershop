// hooks/admin/useAdminAuth.ts
'use client';

import { useState, useEffect } from 'react';

interface UseAdminAuthReturn {
  isLogged: boolean;
  loading: boolean;
  logout: () => void;
  login: (token: string) => void;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verificar si hay token al cargar
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('admin_token');
        setIsLogged(!!token);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLogged(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsLogged(true);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsLogged(false);
    window.location.href = '/admin/login';
  };

  return {
    isLogged,
    loading,
    login,
    logout
  };
};