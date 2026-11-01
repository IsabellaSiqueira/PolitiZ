/**
 * Painel simulado, com uma turma e alunos fictícios, para as rotas funcionarem sem o Supabase.
 * Os números seguem o formato das funções do banco; não vêm de ninguém de verdade.
 */
import { modulo } from "@/data/trilha";
import { ErroDados } from "./index";
import type { DadosPainel, DesempenhoAluno, TurmaPainel } from "./painel";

const turmas: TurmaPainel[] = [
  { id: "turma-exemplo", nome: "1º ano A", serie: "1º ano", codigo: "PQ7K2MXA", validoAte: "2026-12-31", limiteAlunos: 40 },
  { id: "turma-exemplo-b", nome: "1º ano B", serie: "1º ano", codigo: "PQ7K2MXB", validoAte: "2026-12-31", limiteAlunos: null },
];

const NOMES = ["Ana Souza", "Bruno Lima", "Carla Dias", "Davi Rocha", "Elisa Prado", "Felipe Nunes"];

const alunos = (turma: string): DesempenhoAluno[] =>
  NOMES.map((nome, i) => ({
    alunoId: `${turma}-aluno-${i + 1}`,
    nome,
    aulasConcluidas: Math.max(0, modulo.aulas.length - i),
    quizzesFeitos: Math.max(0, modulo.aulas.length - i),
    acerto: i === 5 ? null : 90 - i * 8,
    decisoesVoto: 15 - i * 2,
    ultimaAtividade: i === 5 ? null : "2026-10-30T14:00:00-03:00",
  }));

const encerrados = new Set<string>();

function achar(id: string) {
  const t = turmas.find((x) => x.id === id);
  if (!t) throw new ErroDados("sem_permissao");
  return t;
}

const media = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x !== null);
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10 : null;
};

const ativos = (turma: string) => alunos(turma).filter((a) => !encerrados.has(a.alunoId));

export const painelSimulado: DadosPainel = {
  async turmas() {
    return turmas;
  },
  async criarTurma({ nome, serie, validoAte, limiteAlunos }) {
    const id = `turma-${turmas.length + 1}`;
    const t = { id, nome, serie: serie ?? null, codigo: "PQ7K2MX" + "CDEFGH"[turmas.length % 6], validoAte: validoAte ?? "2026-12-31", limiteAlunos: limiteAlunos ?? null };
    turmas.push(t);
    return { id, codigo: t.codigo, validoAte: t.validoAte };
  },
  async renovarCodigo(turma) {
    const t = achar(turma);
    t.codigo = "PQ7K2MXN";
    return t.codigo;
  },
  async arquivarTurma(turma) {
    achar(turma).codigo = null;
  },
  async indicadores(turma) {
    achar(turma);
    const a = ativos(turma);
    return {
      alunosMatriculados: a.length,
      alunosAtivos: a.filter((x) => x.ultimaAtividade).length,
      aulasConcluidas: a.reduce((s, x) => s + x.aulasConcluidas, 0),
      acertoQuizzes: media(a.map((x) => x.acerto)),
      decisoesVoto: a.reduce((s, x) => s + x.decisoesVoto, 0),
    };
  },
  async progressoPorAula(turma) {
    achar(turma);
    const a = ativos(turma);
    return modulo.aulas.map((aula, i) => ({
      aulaId: aula.id,
      numero: aula.numero,
      titulo: aula.titulo,
      alunosConcluiram: a.filter((x) => x.aulasConcluidas > i).length,
      alunosMatriculados: a.length,
      acertoMedio: 85 - i * 6,
    }));
  },
  async desempenhoAlunos(turma) {
    achar(turma);
    return ativos(turma);
  },
  async questoesComMaisErro(turma, _p, limite = 5) {
    achar(turma);
    return modulo.aulas
      .flatMap((aula) => aula.perguntas.map((q, j) => ({ aula, q, j })))
      .slice(0, limite)
      .map(({ aula, q, j }, i) => ({
        questaoId: `${aula.id}-${j}`,
        aulaTitulo: aula.titulo,
        enunciado: q.enunciado,
        respostas: 6,
        erros: Math.max(1, 4 - i),
        percentualErro: Math.round((Math.max(1, 4 - i) / 6) * 1000) / 10,
      }));
  },
  async sugestaoProximaAula(turma) {
    achar(turma);
    const aula = modulo.aulas[modulo.aulas.length - 1];
    return { tema: aula.titulo, acerto: 61, aulaId: aula.id, aulaTitulo: aula.titulo };
  },
  async relatorio(turma) {
    achar(turma);
    return ativos(turma).map((a) => ({
      aluno: a.nome,
      aulasConcluidas: a.aulasConcluidas,
      quizzesFeitos: a.quizzesFeitos,
      acertoPercentual: a.acerto,
      decisoesVoto: a.decisoesVoto,
      ultimaAtividade: a.ultimaAtividade,
    }));
  },
  async painelEscola(p) {
    return Promise.all(
      turmas.map(async (t) => ({ turmaId: t.id, turmaNome: t.nome, arquivada: !t.codigo, ...(await painelSimulado.indicadores(t.id, p)) })),
    );
  },
  async encerrarMatricula(aluno) {
    encerrados.add(aluno);
  },
};
