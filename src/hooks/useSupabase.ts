import { supabase } from '@/lib/supabaseClient';

export const useSupabase = () => {
  // Helper hook to access Supabase client
  return { supabase };
};