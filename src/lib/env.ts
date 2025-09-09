export const env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://kbbuvheymcqnzalfbmhf.supabase.co",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYnV2aGV5bWNxbnphbGZibWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjY4NDksImV4cCI6MjA3MzAwMjg0OX0.GxpOx_2-9KJwjQmnZZx53uX4dajz5VTp49oiu4JE7f4"
};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase environment variables");
}