// Sorteio dos lotes de leis do Voto às Cegas, com as cotas de docs/criterio-leis.md.
// Não depende de rede: recebe os candidatos e uma função que traz os detalhes de cada um.
// Mesma semente + mesmos candidatos + mesmas exclusões = mesmo lote, em qualquer computador.
import { createHash } from "node:crypto";
import { HOMENAGEM, REGIOES, SITUACAO_FORA, type Regras } from "./regras.ts";

export type Casa = "camara" | "senado";

export type Detalhe = {
  /** situação atual da tramitação, como a fonte informa */
  situacao: string | null;
  tema: string | null;
  autoria: string;
  /** partido atual do autor principal; nulo quando o autor não é parlamentar (ex.: Poder Executivo) */
  partido: string | null;
  uf: string | null;
  coautores: number;
  /** data exata de apresentação, quando só o detalhe traz (AAAA-MM-DD) */
  apresentadaEm?: string;
};

export type Candidato = {
  casa: Casa;
  idExterno: string;
  /** ex.: "PL 1234/2026" */
  rotulo: string;
  ementa: string;
  /** AAAA-MM-DD */
  apresentadaEm: string;
  link: string;
  /** candidatos incluídos à mão (ex.: Senado) já trazem o detalhe */
  detalhe?: Detalhe;
};

export type Escolhida = Candidato & Detalhe & { regiao: string | null; estudante: boolean };
export type Excluida = { casa: Casa; idExterno: string; rotulo: string; motivo: string };

export const chave = (c: { casa: Casa; idExterno: string }) => `${c.casa}:${c.idExterno}`;

/* ---------- Números aleatórios reproduzíveis ---------- */

/** Gerador sfc32 com estado inicial tirado do SHA-256 da semente. */
export function gerador(semente: string) {
  const h = createHash("sha256").update(semente, "utf8").digest();
  let a = h.readUInt32LE(0), b = h.readUInt32LE(4), c = h.readUInt32LE(8), d = h.readUInt32LE(12);
  const proximo = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) proximo();
  return proximo;
}

/** Embaralha (Fisher-Yates) sem mudar a lista original. A ordem de entrada é fixada por chave. */
export function embaralhar<T extends { casa: Casa; idExterno: string }>(itens: T[], semente: string): T[] {
  const r = gerador(semente);
  const lista = [...itens].sort((x, y) => (chave(x) < chave(y) ? -1 : 1));
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

/** Impressão digital da lista de candidatos, para conferir que o sorteio foi refeito sobre a mesma lista. */
export function digital(candidatos: Candidato[]) {
  return createHash("sha256").update(candidatos.map(chave).sort().join("\n")).digest("hex");
}

/* ---------- Filtros ---------- */

/** Primeiro dia da janela de apresentação (ex.: 24 meses antes da data de referência). */
export function inicioJanela(dataReferencia: string, meses: number) {
  const d = new Date(`${dataReferencia}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - meses);
  return d.toISOString().slice(0, 10);
}

/** Motivo automático para excluir, ou nulo se o candidato segue. */
export function motivoAutomatico(c: Candidato, d: Detalhe): string | null {
  if (d.situacao && SITUACAO_FORA.test(d.situacao)) return `fora de tramitação (${d.situacao})`;
  if (HOMENAGEM.test(c.ementa.trim())) return "homenagem ou data comemorativa (filtro automático)";
  return null;
}

/* ---------- Cotas ---------- */

type Contagem = {
  porPartido: Map<string, number>;
  partidos: Set<string>;
  porCasa: { camara: number; senado: number };
  regioes: Set<string>;
  porTema: Map<string, number>;
  temas: Set<string>;
  estudante: number;
};

function contar(lote: Escolhida[]): Contagem {
  const k: Contagem = { porPartido: new Map(), partidos: new Set(), porCasa: { camara: 0, senado: 0 }, regioes: new Set(), porTema: new Map(), temas: new Set(), estudante: 0 };
  for (const e of lote) {
    const p = grupoDoAutor(e);
    k.porPartido.set(p, (k.porPartido.get(p) ?? 0) + 1);
    if (e.partido) k.partidos.add(e.partido);
    k.porCasa[e.casa]++;
    if (e.regiao) k.regioes.add(e.regiao);
    if (e.tema) {
      k.porTema.set(e.tema, (k.porTema.get(e.tema) ?? 0) + 1);
      k.temas.add(e.tema);
    }
    if (e.estudante) k.estudante++;
  }
  return k;
}

/** Autor sem partido (Poder Executivo, comissão) conta como um grupo próprio no limite por partido. */
const grupoDoAutor = (e: Detalhe) => e.partido ?? `sem partido: ${e.autoria}`;

/** O que ainda falta para cumprir cada cota mínima. */
export function faltas(lote: Escolhida[], regras: Regras) {
  const k = contar(lote);
  return {
    partidos: Math.max(0, regras.minPartidos - k.partidos.size),
    camara: Math.max(0, regras.minPorCasa.camara - k.porCasa.camara),
    senado: Math.max(0, regras.minPorCasa.senado - k.porCasa.senado),
    regioes: Math.max(0, regras.minRegioes - k.regioes.size),
    temas: Math.max(0, regras.minTemas - k.temas.size),
    estudante: Math.max(0, regras.minEstudante - k.estudante),
  };
}

/** Cabe no lote sem estourar um limite e sem tornar impossível alguma cota mínima? */
function cabe(lote: Escolhida[], e: Escolhida, regras: Regras) {
  const k = contar(lote);
  if ((k.porPartido.get(grupoDoAutor(e)) ?? 0) >= regras.maxPorPartido) return false;
  if (e.tema && (k.porTema.get(e.tema) ?? 0) >= regras.maxPorTema) return false;
  const depois = [...lote, e];
  const vagas = regras.tamanho - depois.length;
  const f = faltas(depois, regras);
  // cada cota mínima, sozinha, ainda precisa caber nas vagas que sobram
  return f.partidos <= vagas && f.camara + f.senado <= vagas && f.regioes <= vagas && f.temas <= vagas && f.estudante <= vagas;
}

/* ---------- Sorteio ---------- */

export type Resultado =
  | { ok: true; tentativa: number; lote: Escolhida[]; excluidas: Excluida[] }
  | { ok: false; tentativas: number; excluidas: Excluida[]; motivo: string };

/**
 * Embaralha os candidatos com a semente e monta o lote na ordem do embaralhamento,
 * pulando quem estoura uma cota. Se a ordem sorteada não fecha as cotas mínimas,
 * tenta de novo com "semente:1", "semente:2"... A tentativa usada fica no registro.
 */
export async function sortear(opcoes: {
  candidatos: Candidato[];
  detalhar: (c: Candidato) => Promise<Detalhe>;
  semente: string;
  regras: Regras;
  dataReferencia: string;
  /** exclusões da equipe (seção 3 do critério) e leis de lotes anteriores, por chave */
  exclusoes: Map<string, string>;
}): Promise<Resultado> {
  const { regras, exclusoes } = opcoes;
  const inicio = inicioJanela(opcoes.dataReferencia, regras.mesesJanela);
  const excluidas = new Map<string, Excluida>();
  const excluir = (c: Candidato, motivo: string) => excluidas.set(chave(c), { casa: c.casa, idExterno: c.idExterno, rotulo: c.rotulo, motivo });
  const detalhes = new Map<string, Detalhe>();

  const naJanela = opcoes.candidatos.filter((c) => c.apresentadaEm >= inicio && c.apresentadaEm <= opcoes.dataReferencia);

  for (let t = 0; t < regras.maxTentativas; t++) {
    const ordem = embaralhar(naJanela, t === 0 ? opcoes.semente : `${opcoes.semente}:${t}`);
    const lote: Escolhida[] = [];
    for (const c of ordem) {
      if (lote.length === regras.tamanho) break;
      const k = chave(c);
      const manual = exclusoes.get(k);
      if (manual) {
        excluir(c, manual);
        continue;
      }
      if (excluidas.has(k)) continue;
      let d = c.detalhe ?? detalhes.get(k);
      if (!d) {
        d = await opcoes.detalhar(c);
        detalhes.set(k, d);
      }
      const motivo = motivoAutomatico(c, d);
      if (motivo) {
        excluir(c, motivo);
        continue;
      }
      const e: Escolhida = { ...c, ...d, apresentadaEm: d.apresentadaEm ?? c.apresentadaEm, detalhe: undefined, regiao: d.uf ? (REGIOES[d.uf] ?? null) : null, estudante: !!d.tema && regras.temasEstudante.includes(d.tema) };
      if (cabe(lote, e, regras)) lote.push(e);
    }
    const f = faltas(lote, regras);
    if (lote.length === regras.tamanho && Object.values(f).every((x) => x === 0)) {
      return { ok: true, tentativa: t, lote, excluidas: [...excluidas.values()] };
    }
  }
  return {
    ok: false,
    tentativas: regras.maxTentativas,
    excluidas: [...excluidas.values()],
    motivo: "Nenhuma ordem sorteada cumpriu todas as cotas. Faltam candidatos com variedade suficiente (ex.: projetos do Senado, regiões ou temas).",
  };
}

/** Resumo das cotas de um lote, para o registro público. */
export function conferencia(lote: Escolhida[]) {
  const k = contar(lote);
  return {
    leis: lote.length,
    maiorQuantidadePorPartido: Math.max(...k.porPartido.values()),
    partidos: [...k.partidos].sort(),
    porCasa: k.porCasa,
    regioes: [...k.regioes].sort(),
    maiorQuantidadePorTema: Math.max(0, ...k.porTema.values()),
    temas: [...k.temas].sort(),
    ligadasAoEstudante: k.estudante,
  };
}
