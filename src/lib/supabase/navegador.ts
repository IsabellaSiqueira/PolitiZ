import { createBrowserClient } from "@supabase/ssr";
import { supabaseChave, supabaseUrl } from "./config";
import type { Database } from "./tipos-banco";

let cliente: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Cliente do navegador. A sessão do Auth fica em cookies, que o proxy renova a cada visita. */
export function supabaseNavegador() {
  cliente ??= createBrowserClient<Database>(supabaseUrl, supabaseChave);
  return cliente;
}
