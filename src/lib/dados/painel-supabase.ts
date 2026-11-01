/**
 * Painel ligado ao Supabase. As funções do banco conferem o papel e a escola (RLS e
 * security definer); aqui só se traduz o formato. Chamadas sempre por POST (D8).
 */
import type { PostgrestError } from "@supabase/supabase-js";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { ErroDados } from "./index";
import type { DadosPainel, Periodo } from "./painel";

const sb = () => supabaseNavegador();

function falhar(e: PostgrestError): never {
  throw new ErroDados(/^[a-z_]+$/.test(e.message) ? e.message : /fetch|network/i.test(e.message) ? "sem_internet" : "erro_desconhecido");
}
const periodo = (p?: Periodo) => ({ p_de: p?.de ?? null, p_ate: p?.ate ?? null });
const num = (n: number | string | null) => (n === null ? null : Number(n));

export const painelSupabase: DadosPainel = {
  async turmas() {
    const { data, error } = await sb().from("turmas").select("id, nome, serie, codigo, valido_ate, limite_alunos").order("nome");
    if (error) falhar(error);
    return (data ?? []).map((t) => ({ id: t.id, nome: t.nome, serie: t.serie, codigo: t.codigo, validoAte: t.valido_ate, limiteAlunos: t.limite_alunos }));
  },
  async criarTurma({ nome, serie, validoAte, limiteAlunos }) {
    const { data, error } = await sb().rpc("criar_turma", { p_nome: nome, p_serie: serie ?? null, p_valido_ate: validoAte ?? null, p_limite_alunos: limiteAlunos ?? null });
    if (error) falhar(error);
    const t = data![0];
    return { id: t.turma_id, codigo: t.codigo, validoAte: t.valido_ate };
  },
  async renovarCodigo(turma) {
    const { data, error } = await sb().rpc("renovar_codigo", { p_turma: turma });
    if (error) falhar(error);
    return data as string;
  },
  async arquivarTurma(turma) {
    const { error } = await sb().rpc("arquivar_turma", { p_turma: turma });
    if (error) falhar(error);
  },
  async indicadores(turma, p) {
    const { data, error } = await sb().rpc("painel_indicadores", { p_turma: turma, ...periodo(p) });
    if (error) falhar(error);
    const i = data![0];
    return {
      alunosMatriculados: i.alunos_matriculados,
      alunosAtivos: i.alunos_ativos,
      aulasConcluidas: i.aulas_concluidas,
      acertoQuizzes: num(i.acerto_quizzes),
      decisoesVoto: i.decisoes_voto,
    };
  },
  async progressoPorAula(turma) {
    const { data, error } = await sb().rpc("progresso_por_aula", { p_turma: turma });
    if (error) falhar(error);
    return (data ?? []).map((a) => ({
      aulaId: a.aula_id,
      numero: a.numero,
      titulo: a.titulo,
      alunosConcluiram: a.alunos_concluiram,
      alunosMatriculados: a.alunos_matriculados,
      acertoMedio: num(a.acerto_medio),
    }));
  },
  async desempenhoAlunos(turma, p) {
    const { data, error } = await sb().rpc("desempenho_alunos", { p_turma: turma, ...periodo(p) });
    if (error) falhar(error);
    return (data ?? []).map((a) => ({
      alunoId: a.aluno_id,
      nome: a.nome,
      aulasConcluidas: a.aulas_concluidas,
      quizzesFeitos: a.quizzes_feitos,
      acerto: num(a.acerto),
      decisoesVoto: a.decisoes_voto,
      ultimaAtividade: a.ultima_atividade,
    }));
  },
  async questoesComMaisErro(turma, p, limite = 5) {
    const { data, error } = await sb().rpc("questoes_com_mais_erro", { p_turma: turma, ...periodo(p), p_limite: limite });
    if (error) falhar(error);
    return (data ?? []).map((q) => ({
      questaoId: q.questao_id,
      aulaTitulo: q.aula_titulo,
      enunciado: q.enunciado,
      respostas: q.respostas,
      erros: q.erros,
      percentualErro: Number(q.percentual_erro),
    }));
  },
  async sugestaoProximaAula(turma) {
    const { data, error } = await sb().rpc("sugestao_proxima_aula", { p_turma: turma });
    if (error) falhar(error);
    const s = data?.[0];
    return s ? { tema: s.tema_menor_acerto, acerto: num(s.acerto), aulaId: s.aula_sugerida_id, aulaTitulo: s.aula_sugerida_titulo } : null;
  },
  async relatorio(turma, p) {
    const { data, error } = await sb().rpc("relatorio_turma", { p_turma: turma, ...periodo(p) });
    if (error) falhar(error);
    return (data ?? []).map((l) => ({
      aluno: l.aluno,
      aulasConcluidas: l.aulas_concluidas,
      quizzesFeitos: l.quizzes_feitos,
      acertoPercentual: num(l.acerto_percentual),
      decisoesVoto: l.decisoes_voto,
      ultimaAtividade: l.ultima_atividade,
    }));
  },
  async painelEscola(p) {
    const { data, error } = await sb().rpc("painel_escola", periodo(p));
    if (error) falhar(error);
    return (data ?? []).map((t) => ({
      turmaId: t.turma_id,
      turmaNome: t.turma_nome,
      arquivada: t.arquivada,
      alunosMatriculados: t.alunos_matriculados,
      alunosAtivos: t.alunos_ativos,
      aulasConcluidas: t.aulas_concluidas,
      acertoQuizzes: num(t.acerto_quizzes),
      decisoesVoto: t.decisoes_voto,
    }));
  },
  async encerrarMatricula(aluno) {
    const { error } = await sb().rpc("encerrar_matricula", { p_aluno: aluno });
    if (error) falhar(error);
  },
};
