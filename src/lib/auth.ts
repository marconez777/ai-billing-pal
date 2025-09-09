import { Profile } from './types';

// Mock auth functions - replace with real Supabase Auth later
export const getSession = (): { user: Profile | null } => {
  // Mock: return logged user for development
  return {
    user: {
      id: 'mock-user-id',
      user_id: 'mock-user-id',
      name: 'Usuário Mock',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
};

export const isAdmin = (user: Profile | null): boolean => {
  return user?.role === 'admin';
};

export const logout = async () => {
  // Mock logout
  console.log('Mock logout');
};