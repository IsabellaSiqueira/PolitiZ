/**
 * Dados do painel do professor e da coordenação (funções do banco em supabase/README.md).
 *
 * O painel ainda não tem desenho no Figma. Aqui ficam só os tipos, as chamadas e o CSV;
 * as rotas em src/app/painel mostram os dados sem layout, até a Isa mandar o desenho.
 *
 * Regra 1: nada aqui traz voto. Do Voto às Cegas, o painel recebe só a contagem de decisões.
 */

/** Período do painel; sem datas, o banco usa os últimos 7 dias. */
export type Periodo = { de?: string; ate?: string };

export type TurmaPainel = {
  id: string;
  nome: string;
  serie: string | null;
  /** nulo quando a turma está arquivada */
  codigo: string | null;
  validoAte: string | null;
  limiteAlunos: number | null;
};

/** painel_indicadores: os 4 indicadores do documento, mais as decisões (só a contagem). */
export type Indicadores = {
  alunosMatriculados: number;
  alunosAtivos: number;
  aulasConcluidas: number;
  /** de 0 a 100; nulo sem quiz no período */
  acertoQuizzes: number | null;
  decisoesVoto: number;
};

/** progresso_por_aula */
export type ProgressoAula = { aulaId: string; numero: number; titulo: string; alunosConcluiram: number; alunosMatriculados: number; acertoMedio: number | null };

/** desempenho_alunos */
export type DesempenhoAluno = {
  alunoId: string;
  nome: string;
  aulasConcluidas: number;
  quizzesFeitos: number;
  acerto: number | null;
  decisoesVoto: number;
  ultimaAtividade: string | null;
};

/** questoes_com_mais_erro */
export type QuestaoComErro = { questaoId: string; aulaTitulo: string; enunciado: string; respostas: number; erros: number; percentualErro: number };

/** sugestao_proxima_aula */
export type Sugestao = { tema: string; acerto: number | null; aulaId: string | null; aulaTitulo: string | null } | null;

/** relatorio_turma: uma linha por aluno, para o CSV */
export type LinhaRelatorio = { aluno: string; aulasConcluidas: number; quizzesFeitos: number; acertoPercentual: number | null; decisoesVoto: number; ultimaAtividade: string | null };

/** painel_escola: uma linha por turma da escola */
export type TurmaDaEscola = Indicadores & { turmaId: string; turmaNome: string; arquivada: boolean };

export type DadosPainel = {
  /** turmas que a pessoa pode ver (professor: as suas; coordenação: as da escola) */
  turmas(): Promise<TurmaPainel[]>;
  criarTurma(t: { nome: string; serie?: string; validoAte?: string; limiteAlunos?: number }): Promise<{ id: string; codigo: string; validoAte: string }>;
  renovarCodigo(turma: string): Promise<string>;
  arquivarTurma(turma: string): Promise<void>;
  indicadores(turma: string, p?: Periodo): Promise<Indicadores>;
  progressoPorAula(turma: string): Promise<ProgressoAula[]>;
  desempenhoAlunos(turma: string, p?: Periodo): Promise<DesempenhoAluno[]>;
  questoesComMaisErro(turma: string, p?: Periodo, limite?: number): Promise<QuestaoComErro[]>;
  sugestaoProximaAula(turma: string): Promise<Sugestao>;
  relatorio(turma: string, p?: Periodo): Promise<LinhaRelatorio[]>;
  /** só coordenação */
  painelEscola(p?: Periodo): Promise<TurmaDaEscola[]>;
  /** só coordenação: o aluno sai da turma e vira usuário gratuito */
  encerrarMatricula(aluno: string): Promise<void>;
};

const celula = (v: string | number | null) => {
  const s = v === null ? "" : String(v);
  // aspas em volta quando há separador, aspas ou quebra de linha; e nada de fórmula no Excel
  const seguro = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[;"\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
};

/**
 * Monta o CSV do relatório da turma. Separador ";" e vírgula decimal, como o Excel em
 * português abre sem configurar nada. O BOM no começo garante os acentos.
 */
export function csvRelatorio(linhas: LinhaRelatorio[]) {
  const num = (n: number | null) => (n === null ? null : String(n).replace(".", ","));
  const cabecalho = ["Aluno", "Aulas concluídas", "Quizzes feitos", "Acerto (%)", "Decisões no Voto às Cegas", "Última atividade"];
  const corpo = linhas.map((l) =>
    [l.aluno, l.aulasConcluidas, l.quizzesFeitos, num(l.acertoPercentual), l.decisoesVoto, l.ultimaAtividade ? l.ultimaAtividade.slice(0, 10) : null].map(celula).join(";"),
  );
  return "﻿" + [cabecalho.join(";"), ...corpo].join("\r\n") + "\r\n";
}
