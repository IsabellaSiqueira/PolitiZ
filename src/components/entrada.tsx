"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icone } from "./icones";
import { Tela } from "./ui";

/**
 * Molde das telas de entrada (A1 a A16) e das páginas do perfil: topo com voltar e título,
 * o conteúdo e, embaixo, a ação principal (como no protótipo v5).
 */
export function TelaPasso({
  titulo,
  voltar,
  children,
  rodape,
  aoEnviar,
}: {
  /** título do topo, pequeno e centralizado (ex.: "Criar conta") */
  titulo?: string;
  voltar: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  /** com aoEnviar, a tela vira um formulário: Enter envia */
  aoEnviar?: () => void;
}) {
  const corpo = (
    <>
      <main className="flex flex-1 flex-col px-5 pb-4">{children}</main>
      {rodape && <div className="flex flex-col items-center gap-1 px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">{rodape}</div>}
    </>
  );
  return (
    <Tela comNavegacao={false}>
      <header className="grid grid-cols-[44px_1fr_44px] items-center px-3 pt-[max(8px,env(safe-area-inset-top))] pb-1">
        <Link href={voltar} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-tinta">
          <Icone nome="voltar" tamanho={22} />
          <span className="sr-only">Voltar</span>
        </Link>
        {titulo && <p className="text-center text-[15px] font-semibold">{titulo}</p>}
      </header>
      {aoEnviar ? (
        <form
          noValidate
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            aoEnviar();
          }}
        >
          {corpo}
        </form>
      ) : (
        corpo
      )}
    </Tela>
  );
}

/** Erro geral do formulário, anunciado pelo leitor de tela. */
export function AvisoErro({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-4 flex items-start gap-2 rounded-[14px] border-[1.5px] border-erro px-3.5 py-3 text-[15px] font-semibold text-erro">
      <Icone nome="errado" tamanho={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

/** Aviso azul que some sozinho em cerca de 2 segundos (tela A4b). */
export function AvisoRapido({ texto, aoSumir }: { texto: string | null; aoSumir: () => void }) {
  useEffect(() => {
    if (!texto) return;
    const t = setTimeout(aoSumir, 2500);
    return () => clearTimeout(t);
  }, [texto, aoSumir]);
  return (
    <p role="status" className={texto ? "fixed inset-x-5 top-4 z-20 mx-auto max-w-[390px] rounded-[14px] bg-azul px-4 py-3 text-[15px] font-semibold text-branco" : "sr-only"}>
      {texto}
    </p>
  );
}

/** Oito caixas para o código da turma (telas A7 e A14). Por baixo, um campo de texto comum. */
export function CaixasCodigo({ valor, aoMudar, erro, rotulo }: { valor: string; aoMudar: (v: string) => void; erro: boolean; rotulo: string }) {
  const campo = useRef<HTMLInputElement>(null);
  const [focado, setFocado] = useState(false);
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return (
    <div className="relative" onClick={() => campo.current?.focus()}>
      <label htmlFor="codigo-turma" className="sr-only">
        {rotulo}
      </label>
      <input
        ref={campo}
        id="codigo-turma"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        maxLength={11}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-invalid={erro || undefined}
        aria-describedby="codigo-ajuda"
        className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
      />
      <div aria-hidden="true" className={`grid grid-cols-8 gap-1.5 rounded-[12px] ${focado ? "outline-3 outline-offset-4 outline-azul" : ""}`}>
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className={`flex h-12 items-center justify-center rounded-[10px] border-[1.5px] text-lg font-extrabold ${
              erro ? "border-erro text-erro" : focado && i === Math.min(limpo.length, 7) ? "border-azul" : "border-linha"
            }`}
          >
            {limpo[i] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
