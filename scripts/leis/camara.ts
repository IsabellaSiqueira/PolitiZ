// Busca de candidatos na API de Dados Abertos da Câmara (v2).
// Os campos de proposição, autores, temas e deputados são os mesmos que o app já usa em
// src/lib/camara.ts. Dois pontos ainda não foram conferidos contra a API real
// (a rede do ambiente onde isto foi escrito bloqueava a Câmara) e estão marcados "A CONFERIR".
import type { Candidato, Detalhe } from "./sorteio.ts";

const API = process.env.CAMARA_API_URL ?? "https://dadosabertos.camara.leg.br/api/v2";

async function get<T>(caminho: string, tentativas = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(`${API}${caminho}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
      if (!r.ok) throw new Error(`Câmara respondeu ${r.status} em ${caminho}`);
      return ((await r.json()) as { dados: T }).dados;
    } catch (e) {
      if (i >= tentativas) throw e;
      await new Promise((ok) => setTimeout(ok, 1000 * i));
    }
  }
}

type ProposicaoResumo = { id: number; siglaTipo: string; numero: number; ano: number; ementa: string };
type Proposicao = ProposicaoResumo & {
  dataApresentacao?: string;
  // A CONFERIR: nome do campo de situação no detalhe da proposição
  statusProposicao?: { descricaoSituacao?: string | null };
};
type Autor = { uri?: string | null; nome: string; ordemAssinatura?: number; proponente?: number };
type Tema = { tema: string; relevancia?: number };
type Deputado = { ultimoStatus?: { nomeEleitoral?: string; siglaPartido?: string; siglaUf?: string } };

/** Todos os PLs apresentados entre as duas datas (AAAA-MM-DD), página por página. */
export async function candidatosCamara(de: string, ate: string, aviso: (m: string) => void): Promise<Candidato[]> {
  const lista: Candidato[] = [];
  for (let pagina = 1; ; pagina++) {
    // A CONFERIR: nomes dos filtros de data (dataApresentacaoInicio e dataApresentacaoFim)
    const dados = await get<ProposicaoResumo[]>(
      `/proposicoes?siglaTipo=PL&dataApresentacaoInicio=${de}&dataApresentacaoFim=${ate}&ordem=ASC&ordenarPor=id&itens=100&pagina=${pagina}`,
    );
    if (!dados.length) break;
    for (const p of dados) {
      lista.push({
        casa: "camara",
        idExterno: String(p.id),
        rotulo: `${p.siglaTipo} ${p.numero}/${p.ano}`,
        ementa: p.ementa.trim(),
        // a data exata vem no detalhe; a lista já vem filtrada pela janela
        apresentadaEm: ate,
        link: `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`,
      });
    }
    aviso(`Câmara: ${lista.length} projetos (página ${pagina})`);
  }
  return lista;
}

const idDeputado = (uri?: string | null) => uri?.match(/\/deputados\/(\d+)/)?.[1] ?? null;

/** Situação, tema, autor principal e partido atual de um PL. */
export async function detalharCamara(c: Candidato): Promise<Detalhe> {
  const [p, autores, temas] = await Promise.all([
    get<Proposicao>(`/proposicoes/${c.idExterno}`),
    get<Autor[]>(`/proposicoes/${c.idExterno}/autores`),
    get<Tema[]>(`/proposicoes/${c.idExterno}/temas`).catch(() => [] as Tema[]),
  ]);
  const principal = [...autores].sort(
    (a, b) => (b.proponente ?? 0) - (a.proponente ?? 0) || (a.ordemAssinatura ?? 99) - (b.ordemAssinatura ?? 99),
  )[0];
  let autoria = principal?.nome ?? "Autor não informado";
  let partido: string | null = null;
  let uf: string | null = null;
  const dep = idDeputado(principal?.uri);
  if (dep) {
    const d = await get<Deputado>(`/deputados/${dep}`);
    autoria = `Dep. ${d.ultimoStatus?.nomeEleitoral ?? principal.nome}`;
    partido = d.ultimoStatus?.siglaPartido ?? null;
    uf = d.ultimoStatus?.siglaUf ?? null;
  }
  return {
    situacao: p.statusProposicao?.descricaoSituacao ?? null,
    tema: [...temas].sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0))[0]?.tema ?? null,
    autoria,
    partido,
    uf,
    coautores: Math.max(0, autores.length - 1),
    apresentadaEm: p.dataApresentacao?.slice(0, 10),
  };
}
