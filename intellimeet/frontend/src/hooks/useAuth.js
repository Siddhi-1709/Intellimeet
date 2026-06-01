import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

const useAuth = () => {
  const { user, token, isLoading, login, register, logout } = useAuthStore();

  useEffect(() => {
    // Set auth token for all API requests
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const checkAuth = async () => {
    if (token && !user) {
      try {
        const response = await api.get('/auth/me');
        useAuthStore.setState({ user: response.data });
      } catch (error) {
        logout();
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  return {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user
  };
};

export default useAuth;