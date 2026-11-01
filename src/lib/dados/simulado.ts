/**
 * Dados simulados, enquanto o Supabase não está no ar. Nada daqui sai do aparelho:
 * as respostas não são enviadas nem guardadas.
 */
import type { Dados } from "./index";

// as mesmas opções da migração 20261101120000_mecanicas_d12.sql
const OPCOES_TRC = [
  { id: 1, texto: "Pesquisar mais sobre um projeto ou quem o propôs", intencao: true },
  { id: 2, texto: "Conversar sobre política com alguém", intencao: true },
  { id: 3, texto: "Acompanhar uma votação no Congresso", intencao: true },
  { id: 4, texto: "Organizar algo na minha comunidade", intencao: true },
  { id: 5, texto: "Nenhuma por agora", intencao: false },
];

export const simulado: Dados = {
  async opcoesTrc() {
    return OPCOES_TRC;
  },
  async responderTrc() {
    // sem banco, a contagem não vai para lugar nenhum
  },
};
