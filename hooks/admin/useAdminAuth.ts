// lib/admin/useAdminAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { ADMIN_AUTH_TOKEN, ADMIN_USER_DATA } from './constants';

interface AuthState {
  isLogged: boolean;
  loading: boolean;
  user: any | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>({
    isLogged: false,
    loading: true,
    user: null
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem(ADMIN_AUTH_TOKEN);
      const userData = localStorage.getItem(ADMIN_USER_DATA);
      
      if (token && userData) {
        setState({
          isLogged: true,
          loading: false,
          user: JSON.parse(userData)
        });
      } else {
        setState({
          isLogged: false,
          loading: false,
          user: null
        });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setState({
        isLogged: false,
        loading: false,
        user: null
      });
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_AUTH_TOKEN);
    localStorage.removeItem(ADMIN_USER_DATA);
    setState({
      isLogged: false,
      loading: false,
      user: null
    });
    window.location.href = '/admin/login';
  };

  return { 
    isLogged: state.isLogged, 
    loading: state.loading, 
    user: state.user,
    logout 
  };
}