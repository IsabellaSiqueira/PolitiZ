import "server-only";
import { cacheLife } from "next/cache";
import type { Autoria, LeiCartao } from "./tipos";

/**
 * Integração com a API de Dados Abertos da Câmara dos Deputados (v2).
 * https://dadosabertos.camara.leg.br/swagger/api.html
 *
 * Critério de escolha das leis: as mais recentes apresentadas, por ordem de id.
 * É um critério mecânico de propósito: o app não escolhe "a dedo" quais leis mostrar.
 */
// CAMARA_API_URL só existe para testes locais com um servidor simulado
const API = process.env.CAMARA_API_URL ?? "https://dadosabertos.camara.leg.br/api/v2";
const QUANTIDADE = 10;

async function get<T>(caminho: string): Promise<T> {
  const r = await fetch(`${API}${caminho}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`Câmara respondeu ${r.status} em ${caminho}`);
  const corpo = (await r.json()) as { dados: T };
  return corpo.dados;
}

type ProposicaoResumo = { id: number; siglaTipo: string; numero: number; ano: number; ementa: string };
type Tema = { codTema: number; tema: string; relevancia?: number };
type Autor = { uri?: string | null; nome: string; tipo?: string; ordemAssinatura?: number; proponente?: number };
type Deputado = { ultimoStatus?: { nomeEleitoral?: string; siglaPartido?: string; siglaUf?: string } };

export async function buscarLeisRecentes(): Promise<LeiCartao[]> {
  "use cache";
  cacheLife("hours");

  const lista = await get<ProposicaoResumo[]>(
    `/proposicoes?siglaTipo=PL&ordem=DESC&ordenarPor=id&itens=${QUANTIDADE}`,
  );
  if (!lista.length) throw new Error("Nenhuma proposição retornada");

  return Promise.all(
    lista.map(async (p) => {
      let tema: string | null = null;
      try {
        const temas = await get<Tema[]>(`/proposicoes/${p.id}/temas`);
        tema = temas.sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0))[0]?.tema ?? null;
      } catch {
        // projetos recém-apresentados muitas vezes ainda não têm tema classificado
      }
      return {
        id: String(p.id),
        rotulo: `${p.siglaTipo} ${p.numero}/${p.ano}`,
        tema,
        ementa: p.ementa.trim(),
        resumo: null,
      };
    }),
  );
}

function idDeputado(uri?: string | null) {
  const m = uri?.match(/\/deputados\/(\d+)/);
  return m ? m[1] : null;
}

export async function buscarAutoria(id: string): Promise<Autoria> {
  "use cache";
  cacheLife("days");

  const autores = await get<Autor[]>(`/proposicoes/${id}/autores`);
  if (!autores.length) throw new Error("Proposição sem autores");
  const ordenados = [...autores].sort(
    (a, b) => (b.proponente ?? 0) - (a.proponente ?? 0) || (a.ordemAssinatura ?? 99) - (b.ordemAssinatura ?? 99),
  );
  const principal = ordenados[0];
  const dep = idDeputado(principal.uri);

  let autoria = principal.nome;
  let partido: string | null = null;
  if (dep) {
    try {
      const d = await get<Deputado>(`/deputados/${dep}`);
      autoria = `Dep. ${d.ultimoStatus?.nomeEleitoral ?? principal.nome}`;
      partido = d.ultimoStatus?.siglaPartido
        ? `${d.ultimoStatus.siglaPartido}${d.ultimoStatus.siglaUf ? `-${d.ultimoStatus.siglaUf}` : ""}`
        : null;
    } catch {
      autoria = `Dep. ${principal.nome}`;
    }
  }

  return {
    autoria,
    partido,
    coautores: Math.max(0, autores.length - 1),
    fonte: "camara",
    link: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${id}`,
  };
}
