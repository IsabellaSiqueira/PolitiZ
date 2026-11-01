"use client";

import { createContext, Fragment, useContext, useId, useMemo, useRef, useState } from "react";
import { glossario, type Termo } from "@/data/glossario";
import { Icone } from "./icones";

/* ---------- Encontrar os termos num texto ---------- */

const formas = glossario
  .flatMap((t) => [t.termo, ...(t.variantes ?? [])].map((forma) => ({ forma, termo: t })))
  // as formas mais longas primeiro, para "Poder Executivo" ganhar de "Executivo"
  .sort((a, b) => b.forma.length - a.forma.length);

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const busca = new RegExp(`(?<![\\p{L}\\p{N}])(${formas.map((f) => escapar(f.forma)).join("|")})(?![\\p{L}\\p{N}])`, "giu");
const termoDa = (trecho: string) => formas.find((f) => f.forma.toLowerCase() === trecho.toLowerCase())?.termo;

/**
 * Divide o texto em pedaços; cada termo do glossário aparece sublinhado só na primeira vez.
 * `vistos` pode ser dividido entre vários parágrafos da mesma aula.
 */
export function partes(texto: string, vistos = new Set<string>()): (string | { trecho: string; termo: Termo })[] {
  const saida: (string | { trecho: string; termo: Termo })[] = [];
  let fim = 0;
  for (const m of texto.matchAll(busca)) {
    const termo = termoDa(m[0]);
    if (!termo || vistos.has(termo.termo)) continue;
    vistos.add(termo.termo);
    if (m.index > fim) saida.push(texto.slice(fim, m.index));
    saida.push({ trecho: m[0], termo });
    fim = m.index + m[0].length;
  }
  if (fim < texto.length) saida.push(texto.slice(fim));
  return saida;
}

/* ---------- Gaveta com a definição ---------- */

const AbrirTermo = createContext<((t: Termo | "lista") => void) | null>(null);

/** Uma gaveta por tela: o termo sublinhado e o botão do glossário abrem sem sair da tela. */
export function GlossarioProvider({ children }: { children: React.ReactNode }) {
  const gaveta = useRef<HTMLDialogElement>(null);
  const [aberto, setAberto] = useState<Termo | "lista" | null>(null);
  const titulo = useId();
  const abrir = useMemo(
    () => (t: Termo | "lista") => {
      setAberto(t);
      gaveta.current?.showModal();
    },
    [],
  );
  return (
    <AbrirTermo.Provider value={abrir}>
      {children}
      <dialog
        ref={gaveta}
        aria-labelledby={titulo}
        onClick={(e) => e.target === gaveta.current && gaveta.current?.close()}
        className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-[430px] rounded-t-3xl bg-branco p-0 text-tinta backdrop:bg-tinta/40"
      >
        {aberto === "lista" && (
          <div className="pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-linha" />
            <div className="flex items-center justify-between px-5">
              <h2 id={titulo} className="t-subtitulo">
                Glossário
              </h2>
              <form method="dialog">
                <button className="flex min-h-11 min-w-11 items-center justify-center rounded-full" aria-label="Fechar o glossário">
                  <Icone nome="errado" tamanho={20} />
                </button>
              </form>
            </div>
            <ListaGlossario />
          </div>
        )}
        {aberto && aberto !== "lista" && (
          <div className="px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-linha" />
            <p className="t-rotulo text-azul">Termo</p>
            <h2 id={titulo} className="t-subtitulo mt-1">
              {aberto.termo}
            </h2>
            <p className="t-corpo mt-2">{aberto.definicao}</p>
            <form method="dialog" className="pt-4">
              <button className="toque flex min-h-14 w-full items-center justify-center rounded-full border-[1.5px] border-tinta text-base font-bold">
                Entendi
              </button>
            </form>
          </div>
        )}
      </dialog>
    </AbrirTermo.Provider>
  );
}

/** Texto com os termos do glossário sublinhados; tocar no termo abre a definição. */
export function TextoComTermos({ texto, vistos }: { texto: string; vistos?: Set<string> }) {
  const abrir = useContext(AbrirTermo);
  if (!abrir) return <>{texto}</>;
  return (
    <>
      {partes(texto, vistos).map((p, i) =>
        typeof p === "string" ? (
          <Fragment key={i}>{p}</Fragment>
        ) : (
          <button
            key={i}
            type="button"
            // termo dentro do texto segue o tamanho da linha (exceção de alvo pequeno da WCAG)
            data-termo
            aria-haspopup="dialog"
            onClick={() => abrir(p.termo)}
            className="inline cursor-help underline decoration-azul decoration-dotted decoration-2 underline-offset-4"
          >
            {p.trecho}
          </button>
        ),
      )}
    </>
  );
}

/** Botão do cabeçalho que abre o glossário inteiro numa gaveta (sem perder o quiz em andamento). */
export function BotaoGlossario() {
  const abrir = useContext(AbrirTermo);
  if (!abrir) return null;
  return (
    <button
      type="button"
      onClick={() => abrir("lista")}
      aria-haspopup="dialog"
      className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-tinta"
    >
      <Icone nome="trilhas" tamanho={22} />
      <span className="sr-only">Abrir o glossário</span>
    </button>
  );
}

/* ---------- Lista completa (aba do glossário) ---------- */

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function ListaGlossario() {
  const id = useId();
  const [termo, setTermo] = useState("");
  const t = normalizar(termo.trim());
  const lista = [...glossario]
    .sort((a, b) => a.termo.localeCompare(b.termo, "pt-BR"))
    .filter((g) => !t || normalizar(`${g.termo} ${g.definicao}`).includes(t));
  return (
    <>
      <search className="block px-5 pt-4">
        <label htmlFor={id} className="sr-only">
          Buscar no glossário
        </label>
        <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-linha bg-branco px-3.5 focus-within:border-azul focus-within:shadow-[0_0_0_1px_var(--color-azul)]">
          <Icone nome="busca" tamanho={18} className="shrink-0 text-suave" />
          <input
            id={id}
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar um termo"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-suave focus-visible:outline-none"
          />
        </div>
      </search>
      <dl className="flex flex-col px-5 pt-3" aria-live="polite">
        {lista.map((g) => (
          <div key={g.termo} className="border-b border-linha py-3.5">
            <dt className="text-base font-bold">{g.termo}</dt>
            <dd className="mt-1 text-[15px] leading-normal text-suave">{g.definicao}</dd>
          </div>
        ))}
        {!lista.length && <p className="py-3 text-sm text-suave">Nenhum termo com “{termo.trim()}” ainda.</p>}
      </dl>
    </>
  );
}
