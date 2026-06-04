const requiredPublicEnv = {
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
};

export function getPublicEnv() {
  return requiredPublicEnv;
}

