import { useState, useEffect } from 'react';
import { Profile } from '@/lib/types';
import { getSession, logout as authLogout } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock session check
    const session = getSession();
    setUser(session.user);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with real Supabase Auth
    console.log('Mock login:', email);
    const mockUser: Profile = {
      id: 'mock-user-id',
      user_id: 'mock-user-id',
      name: email.split('@')[0],
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(mockUser);
    return { error: null };
  };

  const register = async (email: string, password: string, name: string) => {
    // Mock register - replace with real Supabase Auth
    console.log('Mock register:', email, name);
    const mockUser: Profile = {
      id: 'mock-user-id',
      user_id: 'mock-user-id',
      name,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setUser(mockUser);
    return { error: null };
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};