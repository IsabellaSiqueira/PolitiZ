/**
 * Versão do módulo de dados ligada ao Supabase: Auth para a conta e funções do banco (RPC)
 * para todo o resto. Mesmas assinaturas da versão simulada.
 *
 * Logs (D8): o supabase-js chama as funções por POST; nunca use { get: true }, que poria os
 * argumentos na URL. Erros de regra chegam com o código curto na mensagem (ex.: "sem_vidas").
 */
import type { AuthError, PostgrestError } from "@supabase/supabase-js";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { ErroDados, type Dados } from "./index";

const sb = () => supabaseNavegador();

/** Traduz o erro do Supabase para o código que as telas conhecem (./mensagens.ts). */
function codigo(e: PostgrestError | AuthError | Error | null): never {
  const m = e?.message ?? "";
  if (/^[a-z_]+$/.test(m)) throw new ErroDados(m); // erro de regra do banco
  if ("code" in (e ?? {})) {
    const c = (e as AuthError).code;
    if (c === "invalid_credentials") throw new ErroDados("credenciais_invalidas");
    if (c === "user_already_exists" || c === "email_exists") throw new ErroDados("email_em_uso");
    if (c === "weak_password") throw new ErroDados("senha_curta");
    if (c === "email_address_invalid") throw new ErroDados("email_invalido");
  }
  if (/fetch|network/i.test(m)) throw new ErroDados("sem_internet");
  throw new ErroDados("erro_desconhecido");
}

export const supabase: Dados = {
  async conta() {
    const { data: u } = await sb().auth.getUser();
    if (!u.user) return null;
    const { data, error } = await sb().rpc("minha_conta");
    if (error) codigo(error);
    const c = data?.[0];
    if (!c) return null;
    return {
      nome: c.nome,
      email: u.user.email ?? "",
      papel: c.papel,
      gratuito: c.gratuito,
      turma: c.turma_id ? { id: c.turma_id, nome: c.turma_nome ?? "", escola: c.escola_nome ?? "" } : null,
      termosPendentes: c.termos_pendentes,
    };
  },

  async cadastrar({ nome, email, senha }) {
    // o nome vai em options.data e o banco cria o perfil (gatilho criar_perfil_ao_cadastrar)
    const { error } = await sb().auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() }, emailRedirectTo: `${window.location.origin}/termos-e-privacidade` },
    });
    if (error) codigo(error);
  },

  async entrar(email, senha) {
    const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error) codigo(error);
  },

  async sair() {
    await sb().auth.signOut();
  },

  async pedirNovaSenha(email) {
    const { error } = await sb().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/nova-senha` });
    if (error) codigo(error);
  },

  async definirNovaSenha(senha) {
    const { error } = await sb().auth.updateUser({ password: senha });
    if (error) codigo(error);
  },

  async atualizarNome(nome) {
    const { error } = await sb().rpc("atualizar_nome", { p_nome: nome });
    if (error) codigo(error);
  },

  async apagarConta() {
    const { error } = await sb().rpc("apagar_minha_conta");
    if (error) codigo(error);
    await sb().auth.signOut();
  },

  async versaoTermos() {
    const { data, error } = await sb().from("termos_uso").select("versao").lte("publicado_em", new Date().toISOString()).order("versao", { ascending: false }).limit(1);
    if (error) codigo(error);
    return data?.[0]?.versao ?? 1;
  },

  async aceitarTermos(versao) {
    const { error } = await sb().rpc("aceitar_termos", { p_versao: versao });
    if (error) codigo(error);
  },

  async entrarNaTurma(c) {
    const { data, error } = await sb().rpc("entrar_na_turma", { p_codigo: c });
    if (error) codigo(error);
    const t = data?.[0];
    return t ? { id: t.turma_id, nome: t.turma_nome, escola: t.escola_nome } : null;
  },

  async limites() {
    const { data, error } = await sb().rpc("meus_limites");
    if (error) codigo(error);
    const l = data?.[0];
    return { vidasRestantes: l?.vidas_restantes ?? null, decisoesRestantes: l?.decisoes_restantes ?? null, recarregaEm: l?.recarrega_em ?? null };
  },

  async opcoesTrc() {
    const { data, error } = await sb().from("opcoes_trc").select("id, texto, intencao").order("ordem");
    if (error) codigo(error);
    return data ?? [];
  },

  async responderTrc(sessao, opcoes) {
    // sem sessão do banco (Voto às Cegas ainda com a Câmara), não há o que contar
    if (!sessao) return;
    const { error } = await sb().rpc("responder_trc", { p_sessao: sessao, p_opcoes: opcoes });
    if (error) codigo(error);
  },
};
