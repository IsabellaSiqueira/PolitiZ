"use client";

import Link from "next/link";
import { Logo } from "@/components/ui";

/**
 * Moldura provisória do painel do professor e da coordenação. O painel ainda não tem
 * desenho no Figma: estas telas só expõem os dados e as rotas, sem layout de verdade.
 * Quando o desenho chegar, troque esta moldura e as tabelas pelo que a Isa definir.
 */
export function Rascunho({ titulo, voltar, children }: { titulo: string; voltar?: { href: string; texto: string }; children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl bg-branco px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Logo />
        {voltar && (
          <Link href={voltar.href} className="inline-flex min-h-11 items-center font-bold text-azul underline underline-offset-4">
            {voltar.texto}
          </Link>
        )}
      </header>
      <p className="mt-4 rounded-2xl bg-claro px-4 py-3 text-[15px] leading-snug">
        Rascunho sem desenho: esta tela mostra só os dados do painel. O layout vem do Figma.
      </p>
      <main className="mt-4">
        <h1 className="t-titulo">{titulo}</h1>
        {children}
      </main>
    </div>
  );
}

/** Tabela simples, com rolagem própria em telas estreitas. */
export function Tabela({ legenda, colunas, linhas }: { legenda: string; colunas: string[]; linhas: (string | number | null)[][] }) {
  return (
    <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label={legenda}>
      <table className="w-full border-collapse text-left text-[15px]">
        <caption className="sr-only">{legenda}</caption>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c} scope="col" className="border-b border-linha px-2 py-2 font-bold whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="px-2 py-3 text-suave">
                Nada no período.
              </td>
            </tr>
          ) : (
            linhas.map((l, i) => (
              <tr key={i}>
                {l.map((v, j) => (
                  <td key={j} className="border-b border-linha px-2 py-2">
                    {v ?? "sem dados"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const pct = (n: number | null) => (n === null ? null : `${String(n).replace(".", ",")}%`);
export const dia = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : null);
