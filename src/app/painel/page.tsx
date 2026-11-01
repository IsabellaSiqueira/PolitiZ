"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvisoErro } from "@/components/entrada";
import { ErroDados, mensagem, painel, type TurmaDaEscola, type TurmaPainel } from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { Rascunho, Tabela, pct } from "./rascunho";

/**
 * Painel: turmas do professor e, para a coordenação, os indicadores de todas as turmas
 * da escola (painel_escola). Sem desenho ainda: ver ./rascunho.tsx.
 */
export default function Painel() {
  const { conta } = useConta();
  const [turmas, setTurmas] = useState<TurmaPainel[] | null>(null);
  const [escola, setEscola] = useState<TurmaDaEscola[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const coordenacao = conta?.papel === "coordenacao";

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const t = await painel.turmas();
        const e = coordenacao ? await painel.painelEscola() : null;
        if (vivo) {
          setTurmas(t);
          setEscola(e);
        }
      } catch (e) {
        if (vivo) setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
      }
    })();
    return () => {
      vivo = false;
    };
  }, [coordenacao]);

  return (
    <Rascunho titulo={coordenacao ? "Turmas da escola" : "Minhas turmas"}>
      <AvisoErro>{erro}</AvisoErro>
      {turmas && (
        <ul className="mt-4 flex flex-col gap-2">
          {turmas.map((t) => (
            <li key={t.id}>
              <Link href={`/painel/turma/${t.id}`} className="inline-flex min-h-11 items-center font-bold text-azul underline underline-offset-4">
                {t.nome}
              </Link>
              <span className="text-suave">
                {" · "}
                {t.codigo ? `código ${t.codigo}` : "arquivada"}
                {t.validoAte ? `, vale até ${t.validoAte.split("-").reverse().join("/")}` : ""}
                {t.limiteAlunos ? `, até ${t.limiteAlunos} alunos` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      {escola && (
        <>
          <h2 className="t-subtitulo mt-6">Últimos 7 dias</h2>
          <Tabela
            legenda="Indicadores por turma"
            colunas={["Turma", "Matriculados", "Ativos", "Aulas concluídas", "Acerto nos quizzes", "Decisões no Voto às Cegas"]}
            linhas={escola.map((t) => [t.turmaNome + (t.arquivada ? " (arquivada)" : ""), t.alunosMatriculados, t.alunosAtivos, t.aulasConcluidas, pct(t.acertoQuizzes), t.decisoesVoto])}
          />
        </>
      )}
    </Rascunho>
  );
}
