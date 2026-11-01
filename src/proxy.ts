import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseChave, supabaseUrl, usarSupabase } from "@/lib/supabase/config";

/**
 * Renova a sessão do Supabase Auth nos cookies a cada visita (o "middleware" do Next 15 virou
 * "proxy" no Next 16). Sem o Supabase configurado, não faz nada.
 * Não registra nada: nem caminho, nem corpo, nem usuário (D8).
 */
export async function proxy(request: NextRequest) {
  if (!usarSupabase) return NextResponse.next();
  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseChave, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) request.cookies.set(name, value);
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
      },
    },
  });
  // getUser confere o token com o Auth e, se precisar, grava a sessão renovada nos cookies
  await supabase.auth.getUser();
  return resposta;
}

export const config = {
  // tudo menos arquivos estáticos, imagens e o manifesto
  matcher: ["/((?!_next/static|_next/image|icones|colagem|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
