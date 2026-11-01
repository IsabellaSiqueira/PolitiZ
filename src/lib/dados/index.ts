/**
 * Módulo de acesso a dados: o único lugar onde as telas buscam e gravam dados.
 *
 * Hoje responde com dados simulados (./simulado.ts), para as telas funcionarem sem o
 * Supabase no ar. Quando os projetos existirem, ./supabase.ts chama as funções do banco
 * (RPC) com as mesmas assinaturas, e nenhuma tela precisa mudar. Quem escolhe é a variável
 * NEXT_PUBLIC_DADOS ("simulado", o padrão, ou "supabase"), em ./escolha.ts.
 *
 * Regra 1: nenhuma função aqui recebe o voto, a razão ou a opinião do aluno.
 * Logs (D8): as chamadas ao banco vão sempre por POST; nada daqui escreve no console.
 */
import type { OpcaoTrc } from "@/lib/tipos";

export type Papel = "aluno" | "professor" | "coordenacao" | "admin";

/** O que a tela sabe de quem está logado (função `minha_conta` do banco). */
export type Conta = {
  nome: string;
  email: string;
  papel: Papel;
  /** aluno sem turma: tem os limites do plano gratuito */
  gratuito: boolean;
  turma: { id: string; nome: string; escola: string } | null;
  /** falta aceitar a versão vigente dos termos */
  termosPendentes: boolean;
};

export type Limites = { vidasRestantes: number | null; decisoesRestantes: number | null; recarregaEm: string | null };

/** Turma encontrada pelo código (tela A8). */
export type TurmaEncontrada = { id: string; nome: string; escola: string };

/**
 * Erro de regra, com o código curto que o banco devolve (ex.: "codigo_expirado").
 * A mensagem em português sai de ./mensagens.ts.
 */
export class ErroDados extends Error {
  constructor(public codigo: string) {
    super(codigo);
  }
}

export type Dados = {
  /* ---------- conta (Supabase Auth) ---------- */
  conta(): Promise<Conta | null>;
  cadastrar(dados: { nome: string; email: string; senha: string }): Promise<void>;
  entrar(email: string, senha: string): Promise<void>;
  sair(): Promise<void>;
  /** manda o e-mail com o link de senha nova (telas A3 e A4) */
  pedirNovaSenha(email: string): Promise<void>;
  /** grava a senha nova, depois do link do e-mail (tela A16) */
  definirNovaSenha(senha: string): Promise<void>;
  atualizarNome(nome: string): Promise<void>;
  /** apaga a conta e o progresso; o histórico de quiz fica sem dono (Y18) */
  apagarConta(): Promise<void>;

  /* ---------- termos ---------- */
  versaoTermos(): Promise<number>;
  aceitarTermos(versao: number): Promise<void>;

  /* ---------- turma ---------- */
  /** nulo quando o código não existe (o banco não levanta erro, para contar a tentativa) */
  entrarNaTurma(codigo: string): Promise<TurmaEncontrada | null>;
  limites(): Promise<Limites>;

  /* ---------- Voto às Cegas ---------- */
  /** opções da pergunta da TRC no fim da sessão (Y11) */
  opcoesTrc(): Promise<OpcaoTrc[]>;
  /** soma 1 em cada opção escolhida; não guarda quem respondeu (Y11) */
  responderTrc(sessao: string | null, opcoes: number[]): Promise<void>;
};

export { dados, painel } from "./escolha";
export { csvRelatorio } from "./painel";
export type * from "./painel";
export { mensagem } from "./mensagens";
