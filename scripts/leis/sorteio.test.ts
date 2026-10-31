// Testes do sorteio. Rodar: npm run leis:testar
import { test } from "node:test";
import assert from "node:assert/strict";
import { REGRAS } from "./regras.ts";
import { chave, conferencia, embaralhar, inicioJanela, sortear, type Candidato, type Detalhe } from "./sorteio.ts";

const PARTIDOS = ["PAA", "PBB", "PCC", "PDD", "PEE", "PFF", "PGG", "PHH", "PII", "PJJ", "PKK", "PLL"];
const UFS = ["AC", "BA", "DF", "SP", "RS", "PE", "MG", "AM", "PR", "GO"];
const TEMAS = ["Educação", "Saúde", "Economia", "Meio Ambiente", "Segurança", "Cultura", "Trabalho e Emprego", "Agricultura"];

/** 120 candidatos variados: 80 da Câmara e 40 do Senado, todos dentro da janela. */
function candidatos(): Candidato[] {
  return Array.from({ length: 120 }, (_, i) => {
    const casa = i % 3 === 2 ? "senado" : "camara";
    const detalhe: Detalhe = {
      situacao: "Aguardando Parecer",
      tema: TEMAS[i % TEMAS.length],
      autoria: `Autor ${i}`,
      partido: PARTIDOS[(i * 7) % PARTIDOS.length],
      uf: UFS[(i * 3) % UFS.length],
      coautores: i % 4,
    };
    return {
      casa,
      idExterno: String(1000 + i),
      rotulo: `PL ${1000 + i}/2026`,
      ementa: `Projeto de teste número ${i}.`,
      apresentadaEm: `2026-${String(1 + (i % 9)).padStart(2, "0")}-10`,
      link: `https://exemplo/${i}`,
      // a Câmara passa pela função detalhar; o Senado vem com o detalhe pronto
      ...(casa === "senado" ? { detalhe } : {}),
    };
  });
}

const detalhesCamara = new Map(candidatos().map((c, i) => [chave(c), {
  situacao: i === 4 ? "Arquivada" : "Aguardando Parecer",
  tema: TEMAS[i % TEMAS.length],
  autoria: `Autor ${i}`,
  partido: PARTIDOS[(i * 7) % PARTIDOS.length],
  uf: UFS[(i * 3) % UFS.length],
  coautores: i % 4,
} satisfies Detalhe]));

const opcoes = (extra: Partial<Parameters<typeof sortear>[0]> = {}) => ({
  candidatos: candidatos(),
  detalhar: async (c: Candidato) => detalhesCamara.get(chave(c))!,
  semente: "lote 01 · 2026-11-03",
  regras: REGRAS,
  dataReferencia: "2026-10-31",
  exclusoes: new Map<string, string>(),
  ...extra,
});

test("mesma semente e mesmos candidatos dão o mesmo lote", async () => {
  const a = await sortear(opcoes());
  const b = await sortear(opcoes({ candidatos: candidatos().reverse() }));
  assert.ok(a.ok && b.ok);
  assert.deepEqual(a.lote.map(chave), b.lote.map(chave));
});

test("outra semente dá outro lote", async () => {
  const a = await sortear(opcoes());
  const b = await sortear(opcoes({ semente: "outra semente" }));
  assert.ok(a.ok && b.ok);
  assert.notDeepEqual(a.lote.map(chave), b.lote.map(chave));
});

test("o lote cumpre todas as cotas do critério", async () => {
  const r = await sortear(opcoes());
  assert.ok(r.ok);
  const c = conferencia(r.lote);
  assert.equal(c.leis, 15);
  assert.ok(c.maiorQuantidadePorPartido <= REGRAS.maxPorPartido);
  assert.ok(c.partidos.length >= REGRAS.minPartidos);
  assert.ok(c.porCasa.camara >= 4 && c.porCasa.senado >= 4);
  assert.ok(c.regioes.length >= REGRAS.minRegioes);
  assert.ok(c.maiorQuantidadePorTema <= REGRAS.maxPorTema);
  assert.ok(c.temas.length >= REGRAS.minTemas);
  assert.ok(c.ligadasAoEstudante >= REGRAS.minEstudante);
});

test("exclusão da equipe tira a lei e fica registrada com o motivo", async () => {
  const antes = await sortear(opcoes());
  assert.ok(antes.ok);
  const alvo = antes.lote[0];
  const depois = await sortear(opcoes({ exclusoes: new Map([[chave(alvo), "cita o nome do autor"]]) }));
  assert.ok(depois.ok);
  assert.ok(!depois.lote.some((e) => chave(e) === chave(alvo)));
  assert.deepEqual(depois.excluidas.find((x) => chave(x) === chave(alvo))?.motivo, "cita o nome do autor");
});

test("arquivados e homenagens saem sozinhos, com o motivo", async () => {
  const lista = candidatos();
  lista[0] = { ...lista[0], ementa: "Denomina Viaduto Fulano de Tal o viaduto da BR-000." };
  // todos na frente: a semente não importa para este teste
  const r = await sortear(opcoes({ candidatos: lista, regras: { ...REGRAS, maxTentativas: 50 } }));
  assert.ok(r.ok);
  assert.ok(!r.lote.some((e) => e.idExterno === "1000" || e.idExterno === "1004"));
  const motivos = new Map(r.excluidas.map((x) => [x.idExterno, x.motivo]));
  if (motivos.has("1000")) assert.match(motivos.get("1000")!, /homenagem/);
  if (motivos.has("1004")) assert.match(motivos.get("1004")!, /Arquivada/);
});

test("fora da janela de 24 meses não entra", async () => {
  assert.equal(inicioJanela("2026-10-31", 24), "2024-10-31");
  const lista = candidatos().map((c) => ({ ...c, apresentadaEm: "2023-01-01" }));
  const r = await sortear(opcoes({ candidatos: lista, regras: { ...REGRAS, maxTentativas: 3 } }));
  assert.equal(r.ok, false);
});

test("sem projetos do Senado, o sorteio avisa que não fecha as cotas", async () => {
  const r = await sortear(opcoes({ candidatos: candidatos().filter((c) => c.casa === "camara"), regras: { ...REGRAS, maxTentativas: 5 } }));
  assert.equal(r.ok, false);
  assert.ok(!r.ok && /Senado/.test(r.motivo));
});

test("embaralhar não depende da ordem de entrada", () => {
  const a = embaralhar(candidatos(), "x").map(chave);
  const b = embaralhar([...candidatos()].reverse(), "x").map(chave);
  assert.deepEqual(a, b);
});
