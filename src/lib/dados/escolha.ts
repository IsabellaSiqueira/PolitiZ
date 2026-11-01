import { usarSupabase } from "@/lib/supabase/config";
import { simulado } from "./simulado";
import { supabase } from "./supabase";

/** Supabase quando NEXT_PUBLIC_DADOS=supabase e as chaves estão definidas; senão, simulado. */
export const dados = usarSupabase ? supabase : simulado;
