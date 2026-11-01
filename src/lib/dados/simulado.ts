/**
 * Dados simulados, enquanto o Supabase não está no ar. Seguem as mesmas regras do banco
 * (supabase/migrations) para as telas se comportarem igual quando forem ligadas a ele.
 *
 * A conta simulada fica só neste navegador (nome e e-mail, nunca a senha). O que o banco
 * não guarda (voto, razão, respostas da TRC) também não é guardado aqui.
 *
 * Códigos de turma de exemplo: PQ7K2MXA (encontra), PQ7K2MXZ (venceu), PQ7K2MXL (lotada).
 */
import { ErroDados, type Conta, type Dados } from "./index";

const CHAVE = "politiq:conta-simulada";
const VERSAO_TERMOS = 1;

type ContaSimulada = { nome: string; email: string; termosAceitos: number; turma: Conta["turma"]; logada: boolean };

const TURMAS: Record<string, { turma?: NonNullable<Conta["turma"]>; erro?: string }> = {
  PQ7K2MXA: { turma: { id: "turma-exemplo", nome: "1º ano A", escola: "Escola Estadual Exemplo" } },
  PQ7K2MXZ: { erro: "codigo_expirado" },
  PQ7K2MXL: { erro: "turma_lotada" },
};

// as mesmas opções da migração 20261101120000_mecanicas_d12.sql
const OPCOES_TRC = [
  { id: 1, texto: "Pesquisar mais sobre um projeto ou quem o propôs", intencao: true },
  { id: 2, texto: "Conversar sobre política com alguém", intencao: true },
  { id: 3, texto: "Acompanhar uma votação no Congresso", intencao: true },
  { id: 4, texto: "Organizar algo na minha comunidade", intencao: true },
  { id: 5, texto: "Nenhuma por agora", intencao: false },
];

// Y17: no máximo 5 códigos errados a cada 10 minutos (só na memória da aba)
const errosDeCodigo: number[] = [];

function ler(): ContaSimulada | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as ContaSimulada) : null;
  } catch {
    return null;
  }
}
function gravar(c: ContaSimulada | null) {
  try {
    if (c) window.localStorage.setItem(CHAVE, JSON.stringify(c));
    else window.localStorage.removeItem(CHAVE);
  } catch {
    /* navegação privada: a conta simulada só não sobrevive ao recarregar */
  }
}
function logada() {
  const c = ler();
  if (!c?.logada) throw new ErroDados("sem_login");
  return c;
}
const espera = () => new Promise((ok) => setTimeout(ok, 150));
const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
/** Y16: aceita com ou sem hífen e espaços, maiúsculas ou minúsculas */
const normalizarCodigo = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const simulado: Dados = {
  async conta() {
    const c = ler();
    if (!c?.logada) return null;
    return {
      nome: c.nome,
      email: c.email,
      papel: "aluno",
      gratuito: !c.turma,
      turma: c.turma,
      termosPendentes: c.termosAceitos < VERSAO_TERMOS,
    };
  },

  async cadastrar({ nome, email, senha }) {
    await espera();
    if (!nome.trim() || nome.trim().length > 80) throw new ErroDados("nome_invalido");
    if (!emailValido(email)) throw new ErroDados("email_invalido");
    if (senha.length < 8) throw new ErroDados("senha_curta");
    const atual = ler();
    if (atual && atual.email === email.trim().toLowerCase()) throw new ErroDados("email_em_uso");
    gravar({ nome: nome.trim(), email: email.trim().toLowerCase(), termosAceitos: 0, turma: null, logada: true });
  },

  async entrar(email, senha) {
    await espera();
    const c = ler();
    // simulação: qualquer senha de 8 ou mais caracteres serve para o e-mail cadastrado
    if (!c || c.email !== email.trim().toLowerCase() || senha.length < 8) throw new ErroDados("credenciais_invalidas");
    gravar({ ...c, logada: true });
  },

  async sair() {
    const c = ler();
    if (c) gravar({ ...c, logada: false });
  },

  async pedirNovaSenha(email) {
    await espera();
    if (!emailValido(email)) throw new ErroDados("email_invalido");
    // como o Supabase: responde igual exista ou não a conta, para não revelar quem tem cadastro
  },

  async definirNovaSenha(senha) {
    await espera();
    if (senha.length < 8) throw new ErroDados("senha_curta");
  },

  async atualizarNome(nome) {
    const c = logada();
    if (!nome.trim() || nome.trim().length > 80) throw new ErroDados("nome_invalido");
    gravar({ ...c, nome: nome.trim() });
  },

  async apagarConta() {
    logada();
    await espera();
    gravar(null);
    // o progresso local também some, como no banco
    try {
      window.localStorage.removeItem("politiq:v2");
    } catch {
      /* nada a apagar */
    }
  },

  async versaoTermos() {
    return VERSAO_TERMOS;
  },

  async aceitarTermos(versao) {
    const c = logada();
    if (versao !== VERSAO_TERMOS) throw new ErroDados("versao_invalida");
    gravar({ ...c, termosAceitos: versao });
  },

  async entrarNaTurma(codigo) {
    const c = logada();
    if (c.termosAceitos < VERSAO_TERMOS) throw new ErroDados("termos_pendentes");
    await espera();
    const agora = Date.now();
    while (errosDeCodigo.length && errosDeCodigo[0] < agora - 10 * 60_000) errosDeCodigo.shift();
    if (errosDeCodigo.length >= 5) throw new ErroDados("muitas_tentativas");
    const achada = TURMAS[normalizarCodigo(codigo)];
    if (!achada) {
      errosDeCodigo.push(agora);
      return null;
    }
    if (achada.erro) throw new ErroDados(achada.erro);
    if (c.turma && c.turma.id !== achada.turma!.id) throw new ErroDados("ja_em_outra_turma");
    gravar({ ...c, turma: achada.turma! });
    return achada.turma!;
  },

  async limites() {
    const c = ler();
    // aluno de turma não tem limite; o gratuito tem 5 aulas novas e 5 decisões por dia
    if (!c?.logada || c.turma) return { vidasRestantes: null, decisoesRestantes: null, recarregaEm: null };
    return { vidasRestantes: 5, decisoesRestantes: 5, recarregaEm: null };
  },

  async opcoesTrc() {
    return OPCOES_TRC;
  },

  async responderTrc() {
    // sem banco, a contagem não vai para lugar nenhum
  },
};
