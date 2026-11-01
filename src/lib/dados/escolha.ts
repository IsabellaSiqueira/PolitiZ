import { usarSupabase } from "@/lib/supabase/config";
import { simulado } from "./simulado";
import { supabase } from "./supabase";
import { painelSimulado } from "./painel-simulado";
import { painelSupabase } from "./painel-supabase";

/** Supabase quando NEXT_PUBLIC_DADOS=supabase e as chaves estão definidas; senão, simulado. */
export const dados = usarSupabase ? supabase : simulado;

/** Painel do professor e da coordenação, com a mesma escolha. */
export const painel = usarSupabase ? painelSupabase : painelSimulado;
