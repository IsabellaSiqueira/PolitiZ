// Gera supabase/seed.sql a partir do conteúdo provisório do app
// (src/data/trilha.ts e src/data/leis.ts), para o banco começar igual ao app.
// Rodar: npm run banco:seed
import { writeFileSync } from "node:fs";
import { modulo } from "../src/data/trilha.ts";
import { leis } from "../src/data/leis.ts";

const q = (s: string | null | undefined) => (s == null ? "null" : `'${s.replaceAll("'", "''")}'`);
const arr = (xs: string[]) => `array[${xs.map(q).join(", ")}]::text[]`;

const linhas: string[] = [
  "-- Dados iniciais para desenvolvimento e testes. Gerado por scripts/gerar-seed.ts: não edite à mão.",
  "-- O conteúdo das aulas é provisório; as leis são fictícias (fonte 'exemplo').",
  "",
  "insert into public.termos_uso (versao, endereco, publicado_em) values (1, '/termos', '2026-10-01');",
  "",
  `insert into public.modulos (numero, titulo, tema, descricao, publicado) values (${modulo.numero}, ${q(modulo.titulo)}, ${q(modulo.tema)}, ${q(modulo.descricao)}, true);`,
];

for (const a of modulo.aulas) {
  linhas.push(
    "",
    `insert into public.aulas (modulo_id, slug, numero, titulo, resumo, texto, publicado)`,
    `select id, ${q(a.id)}, ${a.numero}, ${q(a.titulo)}, ${q(a.resumo)}, ${arr(a.texto)}, true from public.modulos where numero = ${modulo.numero};`,
  );
  a.perguntas.forEach((p, i) => {
    linhas.push(
      // só para desenvolvimento: em produção a revisão é registrada por quem revisou de fato
      `insert into public.questoes (aula_id, ordem, enunciado, explicacao, revisada_por, revisada_em) select id, ${i + 1}, ${q(p.enunciado)}, ${q(p.explicacao)}, 'seed de desenvolvimento', now() from public.aulas where slug = ${q(a.id)};`,
      `insert into public.alternativas (questao_id, letra, texto, correta) select q.id, v.letra, v.texto, v.letra = ${q(p.correta)} from public.questoes q join public.aulas a on a.id = q.aula_id, (values ${p.alternativas
        .map((alt) => `(${q(alt.letra)}, ${q(alt.texto)})`)
        .join(", ")}) as v(letra, texto) where a.slug = ${q(a.id)} and q.ordem = ${i + 1};`,
    );
  });
}

linhas.push("", "insert into public.leis (fonte, id_externo, rotulo, tema, ementa, resumo, apresentada_em, autoria, partido, coautores, publicada) values");
linhas.push(
  leis
    .map((l, i) => {
      const dia = String(1 + i).padStart(2, "0");
      return `  ('exemplo', ${q(`exemplo-${l.numero}`)}, ${q(`PL ${l.numero}`)}, ${q(l.tema)}, ${q(l.ementa)}, ${q(l.resumo)}, '2026-09-${dia}', ${q(l.autoria)}, ${q(l.partido)}, 0, true)`;
    })
    .join(",\n") + ";",
);

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), linhas.join("\n") + "\n");
console.log(`seed.sql gerado: ${modulo.aulas.length} aulas, ${leis.length} leis de exemplo`);
