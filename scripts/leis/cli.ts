// Comandos da equipe para montar os lotes de leis do Voto às Cegas.
// Passo a passo em leis/README.md.
//
//   npm run leis -- candidatos --ate 2026-11-03 [--senado leis/senado.csv]
//   npm run leis -- sortear --candidatos leis/candidatos/2026-11-03.json --lote 01 --semente "..." [--exclusoes leis/exclusoes.csv]
//   npm run leis -- sql --lote 01
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { candidatosCamara, detalharCamara } from "./camara.ts";
import { escreverCsv, lerCsv } from "./csv.ts";
import { REGRAS } from "./regras.ts";
import { chave, conferencia, digital, inicioJanela, sementeMegaSena, sortear, type Candidato, type Detalhe } from "./sorteio.ts";
import { verificar } from "./verificar.ts";

const PASTA = "leis";
const args = process.argv.slice(2);
const comando = args[0];
const opcao = (nome: string) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const obrigatoria = (nome: string) => {
  const v = opcao(nome);
  if (!v) parar(`Falta a opção --${nome}.`);
  return v!;
};
function parar(msg: string): never {
  console.error(`\n${msg}\n`);
  process.exit(1);
}
const lerJson = <T>(arquivo: string): T => JSON.parse(readFileSync(arquivo, "utf8")) as T;
const gravarJson = (arquivo: string, dados: unknown) => writeFileSync(arquivo, JSON.stringify(dados, null, 2) + "\n");

type Lista = { dataReferencia: string; geradaEm: string; digital: string; candidatos: Candidato[] };
type Registro = {
  lote: string;
  semente: string;
  tentativa: number;
  dataReferencia: string;
  digitalDosCandidatos: string;
  candidatosNaLista: number;
  regras: typeof REGRAS;
  conferencia: ReturnType<typeof conferencia>;
  excluidas: { casa: string; idExterno: string; rotulo: string; motivo: string }[];
  leis: Record<string, unknown>[];
};

/* ---------- 1. candidatos: congela a lista de projetos da data ---------- */

async function candidatos() {
  const ate = obrigatoria("ate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ate)) parar("Use a data no formato AAAA-MM-DD.");
  const de = inicioJanela(ate, REGRAS.mesesJanela);
  const lista = await candidatosCamara(de, ate, (m) => console.log(m));

  // O Senado ainda entra por planilha preenchida pela equipe (leis/README.md, "Senado")
  const senado = opcao("senado");
  if (senado) {
    for (const l of lerCsv(readFileSync(senado, "utf8"))) {
      const detalhe: Detalhe = {
        situacao: l.situacao || null,
        tema: l.tema || null,
        autoria: l.autoria,
        partido: l.partido || null,
        uf: l.uf || null,
        coautores: Number(l.coautores || 0),
        linkAutor: l.link_autor || null,
      };
      if (!l.id_externo || !l.rotulo || !l.ementa || !l.apresentada_em || !l.link || !l.autoria) {
        parar(`Linha incompleta na planilha do Senado: ${JSON.stringify(l)}`);
      }
      lista.push({ casa: "senado", idExterno: l.id_externo, rotulo: l.rotulo, ementa: l.ementa, apresentadaEm: l.apresentada_em, link: l.link, detalhe });
    }
    console.log(`Senado: ${lista.filter((c) => c.casa === "senado").length} projetos da planilha`);
  }

  mkdirSync(join(PASTA, "candidatos"), { recursive: true });
  const arquivo = join(PASTA, "candidatos", `${ate}.json`);
  const dados: Lista = { dataReferencia: ate, geradaEm: new Date().toISOString(), digital: digital(lista), candidatos: lista };
  gravarJson(arquivo, dados);
  console.log(`\n${lista.length} candidatos em ${arquivo}\nDigital da lista: ${dados.digital}\nPublique a digital antes de escolher a semente.`);
}

/* ---------- 2. sortear: monta o lote e a planilha de resumos ---------- */

/** Leis de lotes anteriores não podem ser sorteadas de novo. */
function jaSorteadas(menos: string) {
  const usadas = new Map<string, string>();
  const pasta = join(PASTA, "lotes");
  if (!existsSync(pasta)) return usadas;
  for (const lote of readdirSync(pasta)) {
    const arq = join(pasta, lote, "registro.json");
    if (lote === menos || !existsSync(arq)) continue;
    for (const l of lerJson<Registro>(arq).leis) usadas.set(`${l.casa}:${l.idExterno}`, `já sorteada no lote ${lote}`);
  }
  return usadas;
}

async function sortearLote() {
  const arquivo = obrigatoria("candidatos");
  const lote = obrigatoria("lote");
  const semente = sementeMegaSena(obrigatoria("semente"));
  if (!semente) parar('A semente é o resultado de um concurso da Mega-Sena, com o número do concurso e as 6 dezenas. Ex.: --semente "Mega-Sena 2850: 04 11 23 35 47 58"');
  const lista = lerJson<Lista>(arquivo);
  if (digital(lista.candidatos) !== lista.digital) parar("A lista de candidatos foi alterada depois de gerada (a digital não confere).");

  const pastaLote = join(PASTA, "lotes", lote);
  if (existsSync(join(pastaLote, "leis.sql")) && !args.includes("--substituir")) {
    parar(`O lote ${lote} já gerou SQL. Para sortear de novo, use --substituir.`);
  }

  const exclusoes = jaSorteadas(lote);
  const arqExclusoes = opcao("exclusoes");
  if (arqExclusoes) {
    for (const l of lerCsv(readFileSync(arqExclusoes, "utf8"))) {
      if (!l.motivo) parar(`Exclusão sem motivo: ${l.casa}:${l.id_externo}. Todo motivo fica no registro.`);
      exclusoes.set(`${l.casa}:${l.id_externo}`, l.motivo);
    }
  }

  // detalhes ficam guardados ao lado da lista: refazer o sorteio dá o mesmo resultado
  // mesmo que um deputado troque de partido depois
  const arqDetalhes = arquivo.replace(/\.json$/, ".detalhes.json");
  const cache: Record<string, Detalhe> = existsSync(arqDetalhes) ? lerJson(arqDetalhes) : {};
  let novos = 0;
  const detalhar = async (c: Candidato) => {
    const k = chave(c);
    if (!cache[k]) {
      cache[k] = await detalharCamara(c);
      if (++novos % 10 === 0) {
        gravarJson(arqDetalhes, cache);
        console.log(`${novos} projetos detalhados...`);
      }
    }
    return cache[k];
  };

  const r = await sortear({ candidatos: lista.candidatos, detalhar, semente, regras: REGRAS, dataReferencia: lista.dataReferencia, exclusoes });
  gravarJson(arqDetalhes, cache);
  if (!r.ok) parar(r.motivo);

  mkdirSync(pastaLote, { recursive: true });
  const registro: Registro = {
    lote,
    semente,
    tentativa: r.tentativa,
    dataReferencia: lista.dataReferencia,
    digitalDosCandidatos: lista.digital,
    candidatosNaLista: lista.candidatos.length,
    regras: REGRAS,
    conferencia: conferencia(r.lote),
    excluidas: r.excluidas,
    leis: r.lote.map((e) => ({ ...e, detalhe: undefined })),
  };
  gravarJson(join(pastaLote, "registro.json"), registro);

  // planilha para a equipe escrever e revisar os resumos
  const resumos = join(pastaLote, "resumos.csv");
  const anteriores = existsSync(resumos) ? new Map(lerCsv(readFileSync(resumos, "utf8")).map((l) => [`${l.casa}:${l.id_externo}`, l])) : new Map();
  writeFileSync(
    resumos,
    escreverCsv(
      ["casa", "id_externo", "rotulo", "tema", "apresentada_em", "ementa", "link", "link_autor", "autoria", "partido", "uf", "coautores", "resumo", "impacto_social", "escrito_por", "revisado_por"],
      r.lote.map((e) => {
        const a = anteriores.get(chave(e));
        return [e.casa, e.idExterno, e.rotulo, e.tema, e.apresentadaEm, e.ementa, e.link, e.linkAutor, e.autoria, e.partido, e.uf, e.coautores, a?.resumo, a?.impacto_social, a?.escrito_por, a?.revisado_por];
      }),
    ),
  );

  console.log(`\nLote ${lote}: ${r.lote.length} leis (tentativa ${r.tentativa}), ${r.excluidas.length} exclusões registradas.`);
  console.log(`Registro: ${join(pastaLote, "registro.json")}\nResumos para escrever: ${resumos}`);
  console.log("\nConfira as leis sorteadas. Se alguma deve sair (seção 3 do critério), anote em leis/exclusoes.csv com o motivo e rode o sorteio de novo com a mesma semente.");
}

/* ---------- 3. sql: transforma os resumos revisados em cadastro no banco ---------- */

const palavras = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const q = (s: string | null | undefined) => (s == null || s === "" ? "null" : `'${String(s).replaceAll("'", "''")}'`);

function gerarSql() {
  const lote = obrigatoria("lote");
  const pastaLote = join(PASTA, "lotes", lote);
  const linhas = lerCsv(readFileSync(join(pastaLote, "resumos.csv"), "utf8"));
  const problemas: string[] = [];
  for (const l of linhas) {
    if (!l.resumo) problemas.push(`${l.rotulo}: falta o resumo`);
    else if (palavras(l.resumo) > 60) problemas.push(`${l.rotulo}: resumo com ${palavras(l.resumo)} palavras (máximo 60)`);
    if (l.resumo && /\u2014/.test(l.resumo)) problemas.push(`${l.rotulo}: resumo com travessão`);
    if (l.impacto_social && /\u2014/.test(l.impacto_social)) problemas.push(`${l.rotulo}: contexto com travessão`);
    if (l.link_autor && !/^https?:\/\//.test(l.link_autor)) problemas.push(`${l.rotulo}: link do autor precisa começar com https://`);
    if (!l.escrito_por || !l.revisado_por) problemas.push(`${l.rotulo}: falta quem escreveu ou quem revisou`);
    else if (l.escrito_por.trim().toLowerCase() === l.revisado_por.trim().toLowerCase()) problemas.push(`${l.rotulo}: a revisão precisa ser de outra pessoa`);
  }
  if (problemas.length) parar(`Antes de gerar o SQL:\n- ${problemas.join("\n- ")}`);

  const sql = [
    `-- Lote ${lote} do Voto às Cegas. Gerado por "npm run leis -- sql --lote ${lote}". Rode no SQL Editor do Supabase.`,
    "insert into public.leis (fonte, id_externo, rotulo, tema, ementa, resumo, impacto_social, apresentada_em, autoria, partido, coautores, link, link_autor, publicada) values",
    linhas
      .map((l) => {
        const partido = l.partido ? `${l.partido}${l.uf ? `-${l.uf}` : ""}` : null;
        return `  (${q(l.casa)}, ${q(l.id_externo)}, ${q(l.rotulo)}, ${q(l.tema)}, ${q(l.ementa)}, ${q(l.resumo)}, ${q(l.impacto_social)}, ${q(l.apresentada_em)}, ${q(l.autoria)}, ${q(partido)}, ${Number(l.coautores || 0)}, ${q(l.link)}, ${q(l.link_autor)}, true)`;
      })
      .join(",\n"),
    "on conflict (fonte, id_externo) do update set resumo = excluded.resumo, impacto_social = excluded.impacto_social, tema = excluded.tema, publicada = true;",
    "",
  ].join("\n");
  writeFileSync(join(pastaLote, "leis.sql"), sql);
  console.log(`SQL do lote ${lote}: ${join(pastaLote, "leis.sql")}`);
}

/* ---------- 4. verificar: confere toda semana a situação das leis publicadas (Y19) ---------- */

async function verificarLeis() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !chave) parar("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (segredos do GitHub).");
  const r = await verificar({ supabaseUrl, chave });
  const linhas = [
    `Leis conferidas: ${r.conferidas}`,
    `Tiradas do ar: ${r.despublicadas.length}`,
    ...r.despublicadas.map((d) => `- ${d.rotulo}: ${d.situacao}`),
    ...(r.puladas.length ? [`Sem busca automática (Senado ou exemplo): ${r.puladas.join(", ")}`] : []),
  ];
  console.log(linhas.join("\n"));
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, `## Verificação semanal das leis\n\n${linhas.join("\n\n")}\n`, { flag: "a" });
}

const comandos: Record<string, () => unknown> = { candidatos, sortear: sortearLote, sql: gerarSql, verificar: verificarLeis };
if (!comando || !comandos[comando]) parar("Comandos: candidatos, sortear, sql, verificar. Passo a passo em leis/README.md.");
await comandos[comando]();
