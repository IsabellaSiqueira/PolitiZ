// Teste da verificação semanal contra um Supabase simulado. Rodar: npm run leis:testar
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { verificar } from "./verificar.ts";

test("tira do ar a lei arquivada e só atualiza a situação das outras", async () => {
  const leis = [
    { id: "a", fonte: "camara", id_externo: "1", rotulo: "PL 1/2026" },
    { id: "b", fonte: "camara", id_externo: "2", rotulo: "PL 2/2026" },
    { id: "c", fonte: "senado", id_externo: "S1", rotulo: "PL 3/2026" },
  ];
  const atualizacoes: Record<string, Record<string, unknown>> = {};
  const servidor = createServer((req, res) => {
    const url = new URL(req.url!, "http://x");
    assert.equal(req.headers.apikey, "segredo");
    if (req.method === "GET" && url.pathname === "/rest/v1/leis") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(leis));
    }
    if (req.method === "PATCH" && url.pathname === "/rest/v1/leis") {
      let corpo = "";
      req.on("data", (c) => (corpo += c));
      req.on("end", () => {
        atualizacoes[url.searchParams.get("id")!.replace("eq.", "")] = JSON.parse(corpo);
        res.writeHead(204).end();
      });
      return;
    }
    res.writeHead(404).end();
  }).listen(0);
  await new Promise((ok) => servidor.once("listening", ok));
  try {
    const r = await verificar({
      supabaseUrl: `http://127.0.0.1:${(servidor.address() as { port: number }).port}`,
      chave: "segredo",
      situacao: async (l) => (l.id_externo === "1" ? "Arquivada" : "Aguardando Parecer"),
      pausaMs: 0,
    });
    assert.equal(r.conferidas, 2);
    assert.deepEqual(r.despublicadas, [{ rotulo: "PL 1/2026", situacao: "Arquivada" }]);
    assert.deepEqual(r.puladas, ["PL 3/2026"]);
    assert.equal(atualizacoes.a.publicada, false);
    assert.equal(atualizacoes.b.publicada, undefined);
    assert.equal(atualizacoes.b.situacao, "Aguardando Parecer");
    assert.equal(atualizacoes.c, undefined);
  } finally {
    servidor.close();
  }
});
