"use client";

import { useEffect, useState } from "react";
import { AvisoErro } from "@/components/entrada";
import { BotaoSecundario } from "@/components/ui";
import {
  csvRelatorio,
  ErroDados,
  mensagem,
  painel,
  type DesempenhoAluno,
  type Indicadores,
  type ProgressoAula,
  type QuestaoComErro,
  type Sugestao,
} from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { Rascunho, Tabela, dia, pct } from "../../rascunho";

type Estado = { indicadores: Indicadores; aulas: ProgressoAula[]; alunos: DesempenhoAluno[]; questoes: QuestaoComErro[]; sugestao: Sugestao };

/**
 * Painel de uma turma: os 4 indicadores, progresso por aula, desempenho por aluno,
 * questões com mais erro, sugestão de retomada e o CSV. Nunca mostra voto: do Voto às
 * Cegas vem só a contagem de decisões. Sem desenho ainda: ver ../../rascunho.tsx.
 */
export default function PainelTurma({ id }: { id: string }) {
  const { conta } = useConta();
  const [estado, setEstado] = useState<Estado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [indicadores, aulas, alunos, questoes, sugestao] = await Promise.all([
          painel.indicadores(id),
          painel.progressoPorAula(id),
          painel.desempenhoAlunos(id),
          painel.questoesComMaisErro(id),
          painel.sugestaoProximaAula(id),
        ]);
        if (vivo) setEstado({ indicadores, aulas, alunos, questoes, sugestao });
      } catch (e) {
        if (vivo) setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
      }
    })();
    return () => {
      vivo = false;
    };
  }, [id, versao]);

  async function baixarCsv() {
    try {
      const linhas = await painel.relatorio(id);
      const url = URL.createObjectURL(new Blob([csvRelatorio(linhas)], { type: "text/csv;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `politiq-turma-${id}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  }

  async function encerrar(aluno: DesempenhoAluno) {
    if (!window.confirm(`Encerrar a matrícula de ${aluno.nome}? A conta continua, no plano gratuito.`)) return;
    try {
      await painel.encerrarMatricula(aluno.alunoId);
      setVersao((v) => v + 1);
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  }

  const i = estado?.indicadores;
  return (
    <Rascunho titulo="Painel da turma" voltar={{ href: "/painel", texto: "Todas as turmas" }}>
      <AvisoErro>{erro}</AvisoErro>
      {estado && i && (
        <>
          <h2 className="t-subtitulo mt-6">Últimos 7 dias</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[15px]">
            <dt>Alunos matriculados</dt>
            <dd className="font-bold">{i.alunosMatriculados}</dd>
            <dt>Alunos ativos</dt>
            <dd className="font-bold">{i.alunosAtivos}</dd>
            <dt>Aulas concluídas</dt>
            <dd className="font-bold">{i.aulasConcluidas}</dd>
            <dt>Acerto nos quizzes</dt>
            <dd className="font-bold">{pct(i.acertoQuizzes) ?? "sem dados"}</dd>
            <dt>Decisões no Voto às Cegas</dt>
            <dd className="font-bold">{i.decisoesVoto}</dd>
          </dl>

          <h2 className="t-subtitulo mt-6">Progresso por aula</h2>
          <Tabela
            legenda="Progresso por aula"
            colunas={["Aula", "Concluíram", "Acerto médio"]}
            linhas={estado.aulas.map((a) => [`${a.numero}. ${a.titulo}`, `${a.alunosConcluiram} de ${a.alunosMatriculados}`, pct(a.acertoMedio)])}
          />

          <h2 className="t-subtitulo mt-6">Questões com mais erro</h2>
          <Tabela
            legenda="Questões com mais erro"
            colunas={["Questão", "Aula", "Erros"]}
            linhas={estado.questoes.map((q) => [q.enunciado, q.aulaTitulo, `${q.erros} de ${q.respostas} (${pct(q.percentualErro)})`])}
          />
          {estado.sugestao && (
            <p className="t-corpo mt-3">
              Vale retomar: <strong>{estado.sugestao.aulaTitulo ?? estado.sugestao.tema}</strong>
              {estado.sugestao.acerto !== null && ` (acerto de ${pct(estado.sugestao.acerto)})`}.
            </p>
          )}

          <h2 className="t-subtitulo mt-6">Desempenho por aluno</h2>
          <Tabela
            legenda="Desempenho por aluno"
            colunas={["Aluno", "Aulas concluídas", "Quizzes", "Acerto", "Decisões", "Última atividade"]}
            linhas={estado.alunos.map((a) => [a.nome, a.aulasConcluidas, a.quizzesFeitos, pct(a.acerto), a.decisoesVoto, dia(a.ultimaAtividade)])}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <BotaoSecundario onClick={baixarCsv}>Baixar CSV</BotaoSecundario>
          </div>

          {conta?.papel === "coordenacao" && (
            <>
              <h2 className="t-subtitulo mt-6">Encerrar matrícula</h2>
              <ul className="mt-2 flex flex-col gap-1">
                {estado.alunos.map((a) => (
                  <li key={a.alunoId}>
                    <button type="button" onClick={() => encerrar(a)} className="inline-flex min-h-11 items-center font-bold text-erro underline underline-offset-4">
                      Encerrar a matrícula de {a.nome}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </Rascunho>
  );
}
