"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { modulo } from "@/data/trilha";

/**
 * Progresso do aluno, guardado só no navegador enquanto o Supabase não entra.
 *
 * REGRA DO MVP: o voto nunca é gravado. Do Voto às Cegas guardamos apenas
 * QUE houve uma decisão sobre uma lei (o id), nunca se foi aprovar ou rejeitar.
 */
export type Voto = "aprovo" | "rejeito";

export type Tentativa = { acertos: number; total: number; em: string };

type Estado = {
  /** aulas que o aluno marcou como concluídas */
  aulasConcluidas: string[];
  /** histórico de tentativas de quiz por aula */
  tentativas: Record<string, Tentativa[]>;
  /** ids das leis em que houve decisão (sem o voto) */
  decididas: string[];
  /** ids das leis puladas, na ordem em que foram puladas */
  puladas: string[];
};

const INICIAL: Estado = { aulasConcluidas: [], tentativas: {}, decididas: [], puladas: [] };
const CHAVE = "politiq:v2";
const CHAVES_ANTIGAS = ["politiq:v1"]; // a v1 guardava votos: é apagada ao abrir o app

type Ctx = Estado & {
  carregado: boolean;
  aulaLiberada: (numero: number) => boolean;
  concluirAula: (id: string) => void;
  registrarTentativa: (id: string, acertos: number, total: number) => void;
  registrarDecisao: (leiId: string) => void;
  pular: (leiId: string) => void;
};

const ProgressoCtx = createContext<Ctx | null>(null);

function ler(): Estado {
  try {
    for (const k of CHAVES_ANTIGAS) window.localStorage.removeItem(k);
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    const s = JSON.parse(bruto) as Partial<Estado>;
    return {
      aulasConcluidas: Array.isArray(s.aulasConcluidas) ? s.aulasConcluidas : [],
      tentativas: s.tentativas && typeof s.tentativas === "object" ? s.tentativas : {},
      decididas: Array.isArray(s.decididas) ? s.decididas.filter((x) => typeof x === "string") : [],
      puladas: Array.isArray(s.puladas) ? s.puladas.filter((x) => typeof x === "string") : [],
    };
  } catch {
    return INICIAL;
  }
}

export function ProgressoProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    // localStorage só existe no navegador: carrega depois da primeira renderização
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstado(ler());
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* navegação privada ou armazenamento cheio: o app segue funcionando sem salvar */
    }
  }, [estado, carregado]);

  const aulaLiberada = useCallback(
    (numero: number) => {
      if (numero === 1) return true;
      const anterior = modulo.aulas.find((a) => a.numero === numero - 1);
      return !!anterior && estado.aulasConcluidas.includes(anterior.id);
    },
    [estado.aulasConcluidas],
  );

  const concluirAula = useCallback((id: string) => {
    setEstado((e) => (e.aulasConcluidas.includes(id) ? e : { ...e, aulasConcluidas: [...e.aulasConcluidas, id] }));
  }, []);

  const registrarTentativa = useCallback((id: string, acertos: number, total: number) => {
    setEstado((e) => ({
      ...e,
      tentativas: { ...e.tentativas, [id]: [...(e.tentativas[id] ?? []), { acertos, total, em: new Date().toISOString() }] },
    }));
  }, []);

  const registrarDecisao = useCallback((leiId: string) => {
    setEstado((e) =>
      e.decididas.includes(leiId)
        ? e
        : { ...e, decididas: [...e.decididas, leiId], puladas: e.puladas.filter((x) => x !== leiId) },
    );
  }, []);

  const pular = useCallback((leiId: string) => {
    // pular não conta: a lei vai pro fim da fila e pode voltar
    setEstado((e) => ({ ...e, puladas: [...e.puladas.filter((x) => x !== leiId), leiId] }));
  }, []);

  const valor = useMemo<Ctx>(
    () => ({ ...estado, carregado, aulaLiberada, concluirAula, registrarTentativa, registrarDecisao, pular }),
    [estado, carregado, aulaLiberada, concluirAula, registrarTentativa, registrarDecisao, pular],
  );

  return <ProgressoCtx.Provider value={valor}>{children}</ProgressoCtx.Provider>;
}

export function useProgresso() {
  const ctx = useContext(ProgressoCtx);
  if (!ctx) throw new Error("useProgresso precisa estar dentro de <ProgressoProvider>");
  return ctx;
}
