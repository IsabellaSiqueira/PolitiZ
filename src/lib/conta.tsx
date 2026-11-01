"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dados, type Conta } from "@/lib/dados";

/** Quem está logado, carregado do módulo de acesso a dados (hoje simulado). */
type Ctx = { conta: Conta | null; carregada: boolean; recarregar: () => Promise<void> };

const ContaCtx = createContext<Ctx | null>(null);

export function ContaProvider({ children }: { children: React.ReactNode }) {
  const [conta, setConta] = useState<Conta | null>(null);
  const [carregada, setCarregada] = useState(false);
  const recarregar = useCallback(async () => {
    setConta(await dados.conta());
    setCarregada(true);
  }, []);
  useEffect(() => {
    // a conta vem do navegador (sessão do Auth): carrega depois da primeira renderização
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void recarregar();
  }, [recarregar]);
  const valor = useMemo(() => ({ conta, carregada, recarregar }), [conta, carregada, recarregar]);
  return <ContaCtx.Provider value={valor}>{children}</ContaCtx.Provider>;
}

export function useConta() {
  const ctx = useContext(ContaCtx);
  if (!ctx) throw new Error("useConta precisa estar dentro de <ContaProvider>");
  return ctx;
}

/** Iniciais para o avatar (sem foto: nada de upload). */
export const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
