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

/** Y3: quiz com 70% ou mais destrava a próxima aula. */
export const NOTA_MINIMA = 70; // por cento
// contas em inteiros, para 0,7 × 10 não virar 7,000000000000001
export const aprovado = (t: { acertos: number; total: number }) => t.acertos * 100 >= t.total * NOTA_MINIMA;
/** Quantos acertos são precisos para chegar a 70% num quiz com este total. */
export const acertosParaAprovar = (total: number) => Math.ceil((total * NOTA_MINIMA) / 100);

/** Postura escolhida na tela de entrada do módulo (Y8). Fica só na memória: nunca é gravada. */
export type Postura = "concordo" | "discordo";

type Estado = {
  /** aulas que o aluno marcou como concluídas */
  aulasConcluidas: string[];
  /** histórico de tentativas de quiz por aula */
  tentativas: Record<string, Tentativa[]>;
  /** ids das leis em que houve decisão (sem o voto) */
  decididas: string[];
  /** ids das leis puladas, na ordem em que foram puladas */
  puladas: string[];
  /** se a tela de entrada do módulo já apareceu (a resposta dela nunca é guardada) */
  entradaVista: boolean;
};

const INICIAL: Estado = { aulasConcluidas: [], tentativas: {}, decididas: [], puladas: [], entradaVista: false };
const CHAVE = "politiq:v2";
const CHAVES_ANTIGAS = ["politiq:v1"]; // a v1 guardava votos: é apagada ao abrir o app

type Ctx = Estado & {
  carregado: boolean;
  aulaLiberada: (numero: number) => boolean;
  /** a aula foi lida e o quiz dela teve 70% ou mais (aula sem quiz: basta a leitura) */
  quizAprovado: (id: string) => boolean;
  /** por que a aula ainda está fechada: falta ler a anterior ou passar no quiz dela */
  motivoBloqueio: (numero: number) => { tipo: "leitura" | "quiz"; anterior: (typeof modulo.aulas)[number] } | null;
  postura: Postura | null;
  escolherPostura: (p: Postura) => void;
  /** endereço para abrir a aula: a primeira passa antes pela tela de entrada do módulo (Y8) */
  linkAula: (aula: { id: string; numero: number }) => string;
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
      entradaVista: s.entradaVista === true,
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

  const [postura, setPostura] = useState<Postura | null>(null);

  const quizAprovado = useCallback(
    (id: string) => {
      const aula = modulo.aulas.find((a) => a.id === id);
      if (!aula || !estado.aulasConcluidas.includes(id)) return false;
      return aula.perguntas.length === 0 || (estado.tentativas[id] ?? []).some(aprovado);
    },
    [estado.aulasConcluidas, estado.tentativas],
  );

  const motivoBloqueio = useCallback(
    (numero: number) => {
      if (numero === 1) return null;
      const anterior = modulo.aulas.find((a) => a.numero === numero - 1);
      if (!anterior) return null;
      if (!estado.aulasConcluidas.includes(anterior.id)) return { tipo: "leitura" as const, anterior };
      if (!quizAprovado(anterior.id)) return { tipo: "quiz" as const, anterior };
      return null;
    },
    [estado.aulasConcluidas, quizAprovado],
  );

  const aulaLiberada = useCallback((numero: number) => motivoBloqueio(numero) === null, [motivoBloqueio]);

  const linkAula = useCallback(
    (aula: { id: string; numero: number }) => (aula.numero === 1 && !estado.entradaVista ? "/entrada" : `/aula/${aula.id}`),
    [estado.entradaVista],
  );

  const escolherPostura = useCallback((p: Postura) => {
    setPostura(p);
    setEstado((e) => ({ ...e, entradaVista: true }));
  }, []);

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
    () => ({
      ...estado,
      carregado,
      aulaLiberada,
      quizAprovado,
      motivoBloqueio,
      postura,
      escolherPostura,
      linkAula,
      concluirAula,
      registrarTentativa,
      registrarDecisao,
      pular,
    }),
    [estado, carregado, aulaLiberada, quizAprovado, motivoBloqueio, postura, escolherPostura, linkAula, concluirAula, registrarTentativa, registrarDecisao, pular],
  );

  return <ProgressoCtx.Provider value={valor}>{children}</ProgressoCtx.Provider>;
}

export function useProgresso() {
  const ctx = useContext(ProgressoCtx);
  if (!ctx) throw new Error("useProgresso precisa estar dentro de <ProgressoProvider>");
  return ctx;
}
