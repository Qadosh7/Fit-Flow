
import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas
const supabaseUrl = 'https://slhgqvkiofseagysfead.supabase.co';
const supabaseAnonKey = 'sb_publishable_HQOJjHo-4RKRCgBDM_1gcA_m0j3vikk';

// Verifica se as chaves estão presentes e se a chave anon parece um JWT válido do Supabase
// (Chaves Supabase reais começam com 'eyJ'. A chave 'sb_publishable' é do Stripe e causaria erros)
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseAnonKey.startsWith('eyJ'));
};

// Inicializa o cliente Supabase apenas se configurado corretamente
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const checkSupabaseConfig = isSupabaseConfigured;
