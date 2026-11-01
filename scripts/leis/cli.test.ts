// Teste de ponta a ponta dos comandos, contra uma Câmara simulada. Rodar: npm run leis:testar
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { escreverCsv, lerCsv } from "./csv.ts";

const rodar = promisify(execFile);
const CLI = new URL("./cli.ts", import.meta.url).pathname;
const PARTIDOS = ["PAA", "PBB", "PCC", "PDD", "PEE", "PFF", "PGG", "PHH", "PII", "PJJ"];
const UFS = ["AC", "BA", "DF", "SP", "RS", "PE", "MG", "AM", "PR"];
const TEMAS = ["Educação", "Saúde", "Economia", "Meio Ambiente", "Segurança", "Cultura", "Trabalho e Emprego"];

// 80 PLs; o 3000 é homenagem e o 3001 está arquivado
const pls = Array.from({ length: 80 }, (_, i) => ({
  id: 3000 + i,
  siglaTipo: "PL",
  numero: 100 + i,
  ano: 2026,
  ementa: i === 0 ? "Denomina Ponte Fulano a ponte sobre o rio X." : `Ementa simulada ${i}.`,
}));

function camaraSimulada() {
  return createServer((req, res) => {
    const url = new URL(req.url!, "http://x");
    const ok = (dados: unknown) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ dados }));
    };
    let m: RegExpMatchArray | null;
    if (url.pathname === "/proposicoes") {
      const pagina = Number(url.searchParams.get("pagina") ?? 1);
      return ok(pls.slice((pagina - 1) * 100, pagina * 100));
    }
    if ((m = url.pathname.match(/^\/proposicoes\/(\d+)$/))) {
      const i = Number(m[1]) - 3000;
      return ok({ ...pls[i], dataApresentacao: "2026-05-02T10:00", statusProposicao: { descricaoSituacao: i === 1 ? "Arquivada" : "Aguardando Parecer" } });
    }
    if ((m = url.pathname.match(/^\/proposicoes\/(\d+)\/autores$/))) return ok([{ uri: `http://x/deputados/${m[1]}`, nome: `Autor ${m[1]}`, proponente: 1, ordemAssinatura: 1 }]);
    if ((m = url.pathname.match(/^\/proposicoes\/(\d+)\/temas$/))) return ok([{ tema: TEMAS[Number(m[1]) % TEMAS.length], relevancia: 1 }]);
    if ((m = url.pathname.match(/^\/deputados\/(\d+)$/))) {
      const i = Number(m[1]);
      return ok({ ultimoStatus: { nomeEleitoral: `Deputada ${i}`, siglaPartido: PARTIDOS[(i * 3) % PARTIDOS.length], siglaUf: UFS[i % UFS.length] } });
    }
    res.writeHead(404).end();
  });
}

test("candidatos → sortear → resumos → sql", async () => {
  const servidor = camaraSimulada().listen(0);
  await new Promise((ok) => servidor.once("listening", ok));
  const porta = (servidor.address() as { port: number }).port;
  const pasta = mkdtempSync(join(tmpdir(), "politiq-leis-"));
  const env = { ...process.env, CAMARA_API_URL: `http://127.0.0.1:${porta}` };
  const cli = (...a: string[]) => rodar(process.execPath, ["--experimental-strip-types", "--no-warnings", CLI, ...a], { cwd: pasta, env });

  try {
    // Senado entra por planilha
    writeFileSync(
      join(pasta, "senado.csv"),
      escreverCsv(
        ["id_externo", "rotulo", "ementa", "apresentada_em", "link", "situacao", "tema", "autoria", "partido", "uf", "coautores"],
        Array.from({ length: 30 }, (_, i) => [`S${i}`, `PL ${500 + i}/2026`, `Ementa do Senado ${i}.`, "2026-04-10", `https://senado/${i}`, "Em tramitação", TEMAS[(i + 2) % TEMAS.length], `Sen. Autora ${i}`, PARTIDOS[(i * 7) % PARTIDOS.length], UFS[(i * 5) % UFS.length], "0"]),
      ),
    );

    await cli("candidatos", "--ate", "2026-10-31", "--senado", "senado.csv");
    const lista = JSON.parse(readFileSync(join(pasta, "leis/candidatos/2026-10-31.json"), "utf8"));
    assert.equal(lista.candidatos.length, 110);

    await cli("sortear", "--candidatos", "leis/candidatos/2026-10-31.json", "--lote", "01", "--semente", "Mega-Sena 2850: 04 11 23 35 47 58");
    const registro = JSON.parse(readFileSync(join(pasta, "leis/lotes/01/registro.json"), "utf8"));
    assert.equal(registro.leis.length, 15);
    assert.ok(registro.conferencia.maiorQuantidadePorPartido <= 2);
    assert.ok(!registro.leis.some((l: { idExterno: string }) => l.idExterno === "3000" || l.idExterno === "3001"));

    assert.equal(registro.semente, "Mega-Sena 2850: 04 11 23 35 47 58");

    // semente que não é resultado da Mega-Sena é recusada
    await assert.rejects(cli("sortear", "--candidatos", "leis/candidatos/2026-10-31.json", "--lote", "09", "--semente", "qualquer coisa"), /Mega-Sena/);

    // refazer com a mesma semente, escrita de outro jeito, dá o mesmo lote (e usa os detalhes guardados)
    await cli("sortear", "--candidatos", "leis/candidatos/2026-10-31.json", "--lote", "01", "--semente", "mega sena 2850 - 58, 47, 35, 23, 11, 4");
    const de_novo = JSON.parse(readFileSync(join(pasta, "leis/lotes/01/registro.json"), "utf8"));
    assert.deepEqual(de_novo.leis.map((l: { idExterno: string }) => l.idExterno), registro.leis.map((l: { idExterno: string }) => l.idExterno));

    // a equipe exclui uma lei com motivo: ela sai e o motivo fica registrado
    const alvo = registro.leis[0];
    writeFileSync(join(pasta, "exclusoes.csv"), escreverCsv(["casa", "id_externo", "motivo"], [[alvo.casa, alvo.idExterno, "cita o nome do autor no texto"]]));
    await cli("sortear", "--candidatos", "leis/candidatos/2026-10-31.json", "--lote", "01", "--semente", "Mega-Sena 2850: 04 11 23 35 47 58", "--exclusoes", "exclusoes.csv");
    const sem_alvo = JSON.parse(readFileSync(join(pasta, "leis/lotes/01/registro.json"), "utf8"));
    assert.ok(!sem_alvo.leis.some((l: { idExterno: string }) => l.idExterno === alvo.idExterno));
    assert.ok(sem_alvo.excluidas.some((x: { motivo: string }) => x.motivo === "cita o nome do autor no texto"));

    // sem resumo, o SQL não sai
    await assert.rejects(cli("sql", "--lote", "01"), /falta o resumo/);

    // a equipe escreve e revisa os resumos
    const resumos = lerCsv(readFileSync(join(pasta, "leis/lotes/01/resumos.csv"), "utf8"));
    const cab = Object.keys(resumos[0]);
    writeFileSync(
      join(pasta, "leis/lotes/01/resumos.csv"),
      escreverCsv(cab, resumos.map((l) => cab.map((c) => (c === "resumo" ? `Muda a regra, "com aspas", para estudantes da escola pública.` : c === "escrito_por" ? "Ana" : c === "revisado_por" ? "Bia" : l[c])))),
    );
    await cli("sql", "--lote", "01");
    const sql = readFileSync(join(pasta, "leis/lotes/01/leis.sql"), "utf8");
    assert.equal(sql.match(/^  \(/gm)?.length, 15);
    assert.match(sql, /"com aspas"/);

    // o lote 02 não repete leis do lote 01
    await cli("sortear", "--candidatos", "leis/candidatos/2026-10-31.json", "--lote", "02", "--semente", "Mega-Sena 2851: 02 09 17 30 44 60", "--exclusoes", "exclusoes.csv");
    const lote2 = JSON.parse(readFileSync(join(pasta, "leis/lotes/02/registro.json"), "utf8"));
    const ids1 = new Set(sem_alvo.leis.map((l: { idExterno: string }) => l.idExterno));
    assert.ok(!lote2.leis.some((l: { idExterno: string }) => ids1.has(l.idExterno)));
  } finally {
    servidor.close();
  }
});
