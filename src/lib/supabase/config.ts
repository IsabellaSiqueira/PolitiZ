/**
 * Variáveis de ambiente do Supabase (ver .env.example). Só a URL e a chave pública vão para o
 * navegador; a chave de serviço nunca entra no app (só nos segredos do GitHub, para a
 * verificação semanal das leis).
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// o painel novo do Supabase chama de "publishable key"; o antigo, de "anon key"
export const supabaseChave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** O app usa o Supabase só quando pedido e configurado; senão, os dados simulados. */
export const usarSupabase = process.env.NEXT_PUBLIC_DADOS === "supabase" && !!supabaseUrl && !!supabaseChave;
