// Servidor que imita a API de Dados Abertos da Câmara, só para os testes.
// O app aponta para ele com CAMARA_API_URL (ver playwright.config.ts).
import { createServer } from "node:http";

const porta = Number(process.env.PORTA ?? 4010);

// 15 projetos de lei, do mais novo para o mais antigo, como a Câmara responde com ordem=DESC
const proposicoes = Array.from({ length: 15 }, (_, i) => {
  const id = 9015 - i;
  return { id, siglaTipo: "PL", numero: 100 + i, ano: 2026, ementa: `Ementa simulada do projeto ${id} para os testes.` };
});

const autorDe = (id) => ({ deputado: 5000 + (id % 100), nome: `Deputada Simulada ${id}` });

function responder(res, status, dados) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ dados }));
}

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${porta}`);
  const p = url.pathname;
  let m;
  if (p === "/proposicoes") return responder(res, 200, proposicoes);
  if ((m = p.match(/^\/proposicoes\/(\d+)\/temas$/))) return responder(res, 200, [{ codTema: 1, tema: "Educação", relevancia: 1 }]);
  if ((m = p.match(/^\/proposicoes\/(\d+)\/autores$/))) {
    const a = autorDe(Number(m[1]));
    return responder(res, 200, [
      { uri: `${url.origin}/deputados/${a.deputado}`, nome: a.nome, tipo: "Deputado(a)", ordemAssinatura: 1, proponente: 1 },
      { uri: null, nome: "Coautora", tipo: "Deputado(a)", ordemAssinatura: 2, proponente: 0 },
    ]);
  }
  if ((m = p.match(/^\/deputados\/(\d+)$/))) {
    const n = Number(m[1]) - 5000;
    return responder(res, 200, { ultimoStatus: { nomeEleitoral: `Simulada ${9000 + n}`, siglaPartido: "PSIM", siglaUf: "DF" } });
  }
  responder(res, 404, []);
}).listen(porta, "127.0.0.1", () => console.log(`Câmara simulada em http://127.0.0.1:${porta}`));
