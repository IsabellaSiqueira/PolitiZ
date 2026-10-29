"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { modulo } from "@/data/trilha";
import { leis } from "@/data/leis";

export type Voto = "aprovo" | "rejeito";

type Estado = {
  pontos: number;
  /** ids das aulas concluídas */
  aulasFeitas: string[];
  /** voto por número da lei */
  votos: Record<string, Voto>;
  /** índice da lei que aparece no Voto às Cegas */
  leiAtual: number;
};

const INICIAL: Estado = { pontos: 0, aulasFeitas: [], votos: {}, leiAtual: 0 };
const CHAVE = "politiq:v1";
const PONTOS_POR_ACERTO = 10;
const PONTOS_POR_VOTO = 5;

type Ctx = Estado & {
  carregado: boolean;
  aulaLiberada: (numero: number) => boolean;
  concluirAula: (id: string, acertos: number) => void;
  votar: (numero: string, voto: Voto) => void;
  proximaLei: () => void;
  refazerVotos: () => void;
};

const ProgressoCtx = createContext<Ctx | null>(null);

function ler(): Estado {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    return { ...INICIAL, ...(JSON.parse(bruto) as Partial<Estado>) };
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
      return !!anterior && estado.aulasFeitas.includes(anterior.id);
    },
    [estado.aulasFeitas],
  );

  const concluirAula = useCallback((id: string, acertos: number) => {
    setEstado((e) =>
      e.aulasFeitas.includes(id)
        ? e
        : { ...e, aulasFeitas: [...e.aulasFeitas, id], pontos: e.pontos + acertos * PONTOS_POR_ACERTO },
    );
  }, []);

  const votar = useCallback((numero: string, voto: Voto) => {
    setEstado((e) => ({
      ...e,
      votos: { ...e.votos, [numero]: voto },
      pontos: e.votos[numero] ? e.pontos : e.pontos + PONTOS_POR_VOTO,
    }));
  }, []);

  const proximaLei = useCallback(() => {
    setEstado((e) => ({ ...e, leiAtual: (e.leiAtual + 1) % leis.length }));
  }, []);

  const refazerVotos = useCallback(() => {
    setEstado((e) => ({ ...e, votos: {}, leiAtual: 0 }));
  }, []);

  const valor = useMemo<Ctx>(
    () => ({ ...estado, carregado, aulaLiberada, concluirAula, votar, proximaLei, refazerVotos }),
    [estado, carregado, aulaLiberada, concluirAula, votar, proximaLei, refazerVotos],
  );

  return <ProgressoCtx.Provider value={valor}>{children}</ProgressoCtx.Provider>;
}

export function useProgresso() {
  const ctx = useContext(ProgressoCtx);
  if (!ctx) throw new Error("useProgresso precisa estar dentro de <ProgressoProvider>");
  return ctx;
}
