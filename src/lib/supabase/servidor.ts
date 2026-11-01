import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseChave, supabaseUrl } from "./config";
import type { Database } from "./tipos-banco";

/**
 * Cliente do servidor (páginas e rotas), com a sessão lida dos cookies. Usa a chave pública:
 * quem lê é o aluno logado, e o RLS do banco decide o que ele pode ver.
 */
export async function supabaseServidor() {
  const loja = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseChave, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) loja.set(name, value, options);
        } catch {
          // chamado de um Server Component, que não grava cookies: o proxy renova a sessão
        }
      },
    },
  });
}
