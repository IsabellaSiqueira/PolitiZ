"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { modulo } from "@/data/trilha";

export type Voto = "aprovo" | "rejeito";
export type Registro = { voto: Voto; tema: string | null };

type Estado = {
  pontos: number;
  /** ids das aulas concluídas */
  aulasFeitas: string[];
  /** voto e tema por id da lei (o tema alimenta o perfil) */
  votos: Record<string, Registro>;
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
  votar: (id: string, voto: Voto, tema: string | null) => void;
  proximaLei: (total: number) => void;
  refazerVotos: () => void;
};

const ProgressoCtx = createContext<Ctx | null>(null);

function ler(): Estado {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return INICIAL;
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    // versões antigas guardavam só "aprovo"/"rejeito": descarta o que não estiver no formato atual
    const votos = Object.fromEntries(
      Object.entries(salvo.votos ?? {}).filter(([, v]) => typeof v === "object" && v !== null),
    ) as Record<string, Registro>;
    return { ...INICIAL, ...salvo, votos };
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

  const votar = useCallback((id: string, voto: Voto, tema: string | null) => {
    setEstado((e) => ({
      ...e,
      votos: { ...e.votos, [id]: { voto, tema } },
      pontos: e.votos[id] ? e.pontos : e.pontos + PONTOS_POR_VOTO,
    }));
  }, []);

  const proximaLei = useCallback((total: number) => {
    setEstado((e) => ({ ...e, leiAtual: (e.leiAtual + 1) % Math.max(1, total) }));
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
