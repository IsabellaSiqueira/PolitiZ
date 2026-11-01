/**
 * Mensagens em português para cada código de erro do banco e do Auth (supabase/README.md).
 * Textos provisórios, na voz do manual: curtos, sem culpar a pessoa. A revisão final é da Isa.
 */
const MENSAGENS: Record<string, string> = {
  // conta
  sem_login: "Entre na sua conta para continuar.",
  credenciais_invalidas: "E-mail ou senha não conferem. Confira e tente de novo.",
  email_em_uso: "Já existe uma conta com esse e-mail. Tente entrar.",
  senha_curta: "A senha precisa ter pelo menos 8 caracteres.",
  email_invalido: "Esse e-mail não parece certo. Confira o que foi digitado.",
  nome_invalido: "O nome precisa ter de 1 a 80 caracteres.",
  sem_permissao: "Sua conta não pode fazer isso.",
  termos_pendentes: "Aceite a versão atual dos termos de uso para continuar.",
  versao_invalida: "Os termos mudaram. Leia a versão nova antes de aceitar.",
  // turma
  codigo_invalido: "Não encontramos uma turma com esse código.",
  codigo_expirado: "O código desta turma venceu. Peça um código novo ao professor.",
  turma_lotada: "A turma já tem o número de alunos combinado. Fale com o professor.",
  escola_lotada: "A escola atingiu o número de alunos do contrato. Fale com a coordenação.",
  escola_sem_contrato: "A escola desta turma não está com o acesso ativo.",
  ja_em_outra_turma: "Você já está em outra turma. Peça à coordenação para encerrar a matrícula anterior.",
  muitas_tentativas: "Muitos códigos errados. Tente de novo daqui a 10 minutos.",
  // aulas e quiz
  aula_bloqueada: "Conclua a aula anterior primeiro.",
  aula_nao_concluida: "Leia a aula e marque como concluída antes do quiz.",
  quiz_em_revisao: "O quiz desta aula ainda está em revisão.",
  sem_vidas: "Suas aulas novas de hoje acabaram. Elas voltam à meia-noite.",
  // Voto às Cegas
  sem_decisoes: "Suas decisões de hoje acabaram. Elas voltam à meia-noite.",
  lei_invalida: "Essa lei não está mais na sua sessão.",
  opcao_invalida: "Escolha pelo menos uma das opções.",
  sessao_invalida: "A pergunta aparece uma vez, no fim de cada sessão.",
  // rede
  sem_internet: "Sem conexão com a internet. Confira o Wi-Fi ou os dados e tente de novo.",
};

export function mensagem(codigo: string) {
  return MENSAGENS[codigo] ?? "Algo deu errado. Tente de novo daqui a pouco.";
}
