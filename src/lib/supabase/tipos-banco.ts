/**
 * Tipos das tabelas e funções do banco usadas pelo app (supabase/migrations).
 * Escritos à mão a partir das migrações; quando os projetos existirem, troque por
 * `npx supabase gen types typescript --project-id <id> > src/lib/supabase/tipos-banco.ts`.
 */
type Tabela<Row> = { Row: Row; Insert: never; Update: never; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      termos_uso: Tabela<{ versao: number; endereco: string; publicado_em: string }>;
      opcoes_trc: Tabela<{ id: number; texto: string; intencao: boolean; ordem: number; ativa: boolean }>;
      glossario: Tabela<{ id: string; termo: string; definicao: string; variantes: string[] }>;
      turmas: Tabela<{ id: string; nome: string; serie: string | null; codigo: string | null; valido_ate: string | null; limite_alunos: number | null; arquivada_em: string | null }>;
    };
    Views: Record<string, never>;
    Functions: {
      minha_conta: {
        Args: Record<string, never>;
        Returns: {
          nome: string;
          papel: "aluno" | "professor" | "coordenacao" | "admin";
          gratuito: boolean;
          turma_id: string | null;
          turma_nome: string | null;
          escola_nome: string | null;
          termos_pendentes: boolean;
        }[];
      };
      meus_limites: { Args: Record<string, never>; Returns: { vidas_restantes: number | null; decisoes_restantes: number | null; recarrega_em: string | null }[] };
      aceitar_termos: { Args: { p_versao: number }; Returns: undefined };
      atualizar_nome: { Args: { p_nome: string }; Returns: undefined };
      apagar_minha_conta: { Args: Record<string, never>; Returns: undefined };
      entrar_na_turma: { Args: { p_codigo: string }; Returns: { turma_id: string; turma_nome: string; escola_nome: string }[] };
      criar_turma: {
        Args: { p_nome: string; p_serie: string | null; p_valido_ate: string | null; p_limite_alunos: number | null };
        Returns: { turma_id: string; codigo: string; valido_ate: string }[];
      };
      renovar_codigo: { Args: { p_turma: string }; Returns: string };
      arquivar_turma: { Args: { p_turma: string }; Returns: undefined };
      painel_indicadores: {
        Args: { p_turma: string; p_de: string | null; p_ate: string | null };
        Returns: { alunos_matriculados: number; alunos_ativos: number; aulas_concluidas: number; acerto_quizzes: number | null; decisoes_voto: number }[];
      };
      progresso_por_aula: {
        Args: { p_turma: string };
        Returns: { modulo_numero: number; aula_id: string; numero: number; titulo: string; alunos_concluiram: number; alunos_matriculados: number; acerto_medio: number | null }[];
      };
      desempenho_alunos: {
        Args: { p_turma: string; p_de: string | null; p_ate: string | null };
        Returns: { aluno_id: string; nome: string; aulas_concluidas: number; quizzes_feitos: number; acerto: number | null; decisoes_voto: number; ultima_atividade: string | null }[];
      };
      questoes_com_mais_erro: {
        Args: { p_turma: string; p_de: string | null; p_ate: string | null; p_limite: number };
        Returns: { questao_id: string; aula_titulo: string; enunciado: string; respostas: number; erros: number; percentual_erro: number }[];
      };
      sugestao_proxima_aula: {
        Args: { p_turma: string };
        Returns: { tema_menor_acerto: string; acerto: number | null; aula_sugerida_id: string | null; aula_sugerida_titulo: string | null }[];
      };
      relatorio_turma: {
        Args: { p_turma: string; p_de: string | null; p_ate: string | null };
        Returns: { aluno: string; aulas_concluidas: number; quizzes_feitos: number; acerto_percentual: number | null; decisoes_voto: number; ultima_atividade: string | null }[];
      };
      painel_escola: {
        Args: { p_de: string | null; p_ate: string | null };
        Returns: {
          turma_id: string;
          turma_nome: string;
          arquivada: boolean;
          alunos_matriculados: number;
          alunos_ativos: number;
          aulas_concluidas: number;
          acerto_quizzes: number | null;
          decisoes_voto: number;
        }[];
      };
      encerrar_matricula: { Args: { p_aluno: string }; Returns: undefined };
      responder_trc: { Args: { p_sessao: string; p_opcoes: number[] }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
