/**
 * Módulo de acesso a dados: o único lugar onde as telas buscam e gravam dados.
 *
 * Hoje responde com dados simulados (./simulado.ts), para as telas funcionarem sem o
 * Supabase no ar. Quando os projetos existirem, ./supabase.ts chama as funções do banco
 * (RPC) com a mesma assinatura, e nenhuma tela precisa mudar. Quem escolhe é a variável
 * NEXT_PUBLIC_DADOS ("simulado" ou "supabase").
 *
 * Regra 1: nenhuma função aqui recebe o voto, a razão ou a opinião do aluno.
 */
import type { OpcaoTrc } from "@/lib/tipos";

export type Dados = {
  /** opções da pergunta da TRC no fim da sessão (Y11) */
  opcoesTrc(): Promise<OpcaoTrc[]>;
  /** soma 1 em cada opção escolhida; não guarda quem respondeu (Y11) */
  responderTrc(sessao: string | null, opcoes: number[]): Promise<void>;
};

export { dados } from "./escolha";
