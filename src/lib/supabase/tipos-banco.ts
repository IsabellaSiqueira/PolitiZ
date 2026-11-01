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
      responder_trc: { Args: { p_sessao: string; p_opcoes: number[] }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
