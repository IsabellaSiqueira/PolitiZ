# politiQ · O que falta para concluir o MVP

Lista de tudo o que precisa acontecer para o MVP rodar no piloto pago em 1 ou 2 escolas, conforme o documento "politiQ · Proposta de desenvolvimento do MVP". Marque `[x]` ao concluir, no mesmo commit da entrega.

**Quem faz:** 🟣 Isa (decisão, conteúdo, design) · 🔵 desenvolvimento · 🟠 jurídico/contador · 🟢 escola piloto

Situação em 31/10/2026: o app roda só no navegador (progresso no `localStorage`), com o sistema visual do manual, as telas do aluno sem login e testes automáticos. O banco do Supabase está escrito e testado, mas não está no ar nem ligado ao app.

---

## 0. Decisões que travam o resto

Sem estas respostas, partes grandes não podem começar. Em ordem de urgência.

- [x] 🟣 **D1. Fonte das leis do Voto às Cegas:** opção B (31/10/2026). Leis escolhidas pela equipe, com resumo próprio, cadastradas no banco. O app mostra o resumo; a ementa oficial e o link ficam como apoio.
- [ ] 🟣 **D1b. Critério de seleção das leis**, para a página pública `/criterio`: quem escolhe, com que regras (temas, equilíbrio entre partidos e regiões, só projetos em tramitação ou também aprovados) e de quanto em quanto tempo entram leis novas. Junto: quantas leis o piloto precisa ter no ar (cada sessão tem 15, e quem decide todas fica sem leis novas).
- [x] 🟣 **D2. As 5 decisões do banco aprovadas** (31/10/2026): aluno sem turma conta como gratuito; trocar de turma exige a coordenação; arquivar turma só desliga o código; professor vê o nome dos alunos; leis cadastradas no banco.
- [ ] 🟣 **D3. Mandar o documento de requisitos** (33 RF, 13 RNF, 33 RN, glossário). Tudo abaixo foi deduzido do documento do MVP; o de requisitos pode acrescentar ou mudar regras.
- [ ] 🟣 **D4. Tamanho do conteúdo no piloto:** quantos módulos e aulas precisam estar prontos no primeiro dia, e em que ritmo entram os outros.
- [ ] 🟣 **D5. O que fazer com a aba Jogos.** Hoje ela lista o Voto às Cegas e 4 jogos "em breve" e "bloqueado" que estão fora do MVP. Manter assim, esconder os futuros, ou voltar ao nome "Ferramentas"?
- [ ] 🟣 **D6. Início sem login:** a busca, os temas e o "quiz do dia" ficam? Os temas Economia, Sociedade e Meio ambiente aparecem como "em breve".
- [ ] 🟣 **D7. Quem revisa a segurança do banco (pacote P1).** O documento pede alguém experiente; o banco foi escrito nesta base. Uma revisão independente antes de receber dados de menores é recomendada.
- [ ] 🟣 **D8. Monitoramento de erros:** usar o Sentry (está no documento) com coleta mínima e sem gravação de sessão, ou ficar sem ele no piloto? Ele é um serviço de terceiros recebendo dados de menores.
- [ ] 🟣 **D9. Escola piloto:** qual, quantas turmas, quantos alunos, professores e coordenação, data de início e duração (o documento fala em 4 a 6 semanas), e o que conta como piloto bem-sucedido.

## 1. Design (🟣 Isa, no Figma)

O manual de identidade e as telas de abertura, início e revelação já existem. Faltam:

- [ ] Tela de abertura completa (o manual mostra "Começar" e "Já tenho uma conta")
- [ ] Cadastro (nome, e-mail, senha) e mensagem "confirme seu e-mail"
- [ ] Login, "esqueci a senha" e nova senha
- [ ] Aceite dos termos (primeiro acesso e quando sair versão nova)
- [ ] Entrar na turma com o código (e os erros: código errado, já está em outra turma, escola sem acesso, muitas tentativas)
- [ ] Vidas e decisões do usuário gratuito: contador no topo (o manual mostra o coração com "5") e as telas de "acabaram por hoje"
- [ ] Trilha com vários módulos
- [ ] Perfil: nome, turma, sair da conta, histórico
- [ ] **Painel do professor no computador** (hoje todo o app é desenhado para celular até 430px): lista de turmas, criar turma, mostrar o código grande para projetar na sala, indicadores com filtro de período, progresso por aula, desempenho por aluno, questões com mais erro, exportar CSV
- [ ] Painel da coordenação: todas as turmas e encerrar matrícula (com confirmação)
- [ ] Estados vazios, carregando, sem internet e erro genérico; página 404
- [ ] Ícones originais em SVG (hoje são redesenhados; o Figma bloqueado nesta máquina impediu baixar)

## 2. Conteúdo e textos (🟣 Isa e equipe)

- [ ] Aulas finais do(s) módulo(s) do piloto (as 4 atuais são provisórias), explicando todo termo técnico na primeira vez
- [ ] Questões com 4 alternativas e explicação de cada uma
- [ ] Revisão pedagógica e de neutralidade política (combinado 05: pessoas, não lados)
- [ ] Escolher as leis do piloto e escrever os resumos (linguagem de quem começa do zero, sem tomar partido), com autor, partido atual, coautores e link oficial
- [ ] Texto novo da página `/criterio`, a partir de D1b
- [ ] E-mails em português: confirmação de conta e redefinição de senha
- [ ] Mensagens de erro de cada código do banco (`sem_vidas`, `escola_lotada` etc.; lista em `supabase/README.md`)
- [ ] Guia rápido para o professor (como criar turma, passar o código, ler o painel)

## 3. Banco e Supabase (🔵, pacotes P1 e P2)

- [x] Esquema, funções, RLS, auditoria e rotina diária (`supabase/migrations`)
- [x] Dados iniciais gerados do app e 107 testes do banco, rodando no GitHub
- [x] Banco ajustado a D1 e D2: lei só vai ao ar com resumo e, se for real, com link oficial
- [ ] Ajustar o banco ao documento de requisitos (D3)
- [ ] Revisão de segurança independente (D7) e correções
- [ ] 🟣 Criar a organização no Supabase e dois projetos: **teste** e **produção**, na região de São Paulo
- [ ] 🟣 Plano pago no projeto de produção (o gratuito pausa projetos parados e não tem backup diário)
- [ ] Aplicar as migrações nos dois projetos; ativar `pg_cron` e conferir o agendamento da rotina
- [ ] Configurar o Auth: só e-mail e senha, confirmação obrigatória, senha mínima, limite de tentativas, URLs de retorno do site, textos dos e-mails em português
- [ ] SMTP próprio pelo Resend (o envio padrão do Supabase tem limite baixo de e-mails por hora)
- [ ] Backups: conferir o backup diário e fazer um teste de restauração
- [ ] Passo a passo para a administração: cadastrar escola, contrato, professores e coordenação pelo painel (criar a conta no Auth, mudar `papel` e `escola_id`)
- [ ] Direitos do titular (LGPD): como atender pedido de acesso e de exclusão de dados (função ou processo manual documentado)
- [ ] Prazo de guarda: o que acontece com os dados de quem saiu da escola e de quem não usa mais a conta

### 3.6 Leis (opção B)

- [ ] Planilha modelo para a equipe preencher as leis e um jeito de importar para a tabela `leis` (ou passo a passo do painel do Supabase)
- [ ] Cadastrar as leis do piloto e marcar como publicadas
- [ ] Tirar do app a busca na Câmara (`src/lib/camara.ts`, a rota `/api/autoria` e a Câmara simulada dos testes) quando o Voto às Cegas passar a vir do banco

## 4. Ligar o app ao banco (🔵, pacote P3)

- [ ] Cliente do Supabase no Next 16 com sessão em cookies (ler `node_modules/next/dist/docs/` antes, pelo `AGENTS.md`)
- [ ] Tipos gerados do banco (`supabase gen types`)
- [ ] Um módulo de acesso a dados usado por todas as telas, com as mensagens de erro em português
- [ ] Trocar o `localStorage` de `src/lib/progresso.tsx` pelas funções do banco (trilha, aulas, quiz, histórico, decisões)
- [ ] Voto às Cegas pela sessão do banco (`sessao_voto`, `pular_lei`, `registrar_decisao`, `revelar_autoria`), mostrando o resumo da equipe e mantendo o voto só na memória da tela
- [ ] Rotas protegidas por papel (aluno, professor, coordenação) e redirecionamento de quem não está logado
- [ ] Geração do CSV do relatório da turma no navegador
- [ ] Aulas e questões vindas do banco (hoje estão em `src/data/trilha.ts`)

## 5. Telas do aluno (🔵, pacote P4)

Já existem sem login: trilha, aula, quiz com explicação e refazer, histórico no perfil, Voto às Cegas, critério, início e jogos.

- [ ] Abertura, cadastro, confirmação de e-mail, login, esqueci a senha, nova senha
- [ ] Aceite dos termos
- [ ] Entrar na turma
- [ ] Vidas e decisões restantes do usuário gratuito, e as telas de limite atingido
- [ ] Trilha com vários módulos, vinda do banco
- [ ] Perfil com nome, turma e sair
- [ ] Páginas públicas de termos de uso e de privacidade
- [ ] Estados de carregando, erro, sem internet e 404
- [ ] Quiz: decidir se a alternativa fica "marcada" antes de confirmar (o manual tem o estado; hoje responde no toque)

## 6. Telas do professor e da coordenação (🔵, pacote P5)

- [ ] Lista de turmas; criar, editar e arquivar
- [ ] Código da turma: mostrar grande, copiar, renovar
- [ ] Adicionar outro professor da escola à turma
- [ ] Painel com os 4 indicadores e filtro de período (padrão: últimos 7 dias)
- [ ] Progresso da turma por aula
- [ ] Desempenho por aluno
- [ ] Tema com menor acerto, sugestão para a próxima aula e questões com mais erro
- [ ] Exportar CSV
- [ ] Coordenação: painel de todas as turmas e encerrar matrícula
- [ ] Layout para computador (e ainda usável no celular)

## 7. Publicação e integrações (🔵 com contas da 🟣, pacote P6)

- [ ] 🟣 Juntar este ramo no `main` (abrir o pull request e revisar)
- [ ] 🟣 Contas: Vercel, Resend, domínio (e Sentry, se D8 = sim)
- [ ] 🟣 Comprar o domínio e apontar para a Vercel (HTTPS automático)
- [ ] Projeto na Vercel com deploy automático: `main` vai para produção, pull requests ganham prévia ligada ao banco de teste
- [ ] Variáveis de ambiente de cada ambiente (URL e chave pública do Supabase; nunca a chave de serviço no navegador)
- [ ] Resend com domínio verificado (SPF e DKIM) para os e-mails não caírem no spam
- [ ] Sentry, se aprovado: sem dados pessoais, sem gravação de sessão, e nenhuma mensagem com voto
- [ ] Cabeçalhos de segurança (política de conteúdo, sem embutir o site em outros sites)
- [ ] Conferir que logs da Vercel e do Supabase não registram voto (já não há como, mas vale a checagem no ar)

## 8. Testes (🔵, pacote P7)

- [x] Testes automáticos das telas atuais: regra do voto, sessão de 15, aulas em sequência, quiz, acessibilidade (axe, 44px, 320px, teclado) e nenhuma requisição a terceiros, rodando no GitHub
- [x] Testes do banco (107 casos)
- [ ] Testes de ponta a ponta dos fluxos novos contra o Supabase local: cadastro, entrar na turma, quiz, Voto às Cegas, limites do gratuito, painel, CSV, encerrar matrícula
- [ ] Rodar o Supabase local no GitHub para esses testes
- [ ] Acessibilidade feita por pessoas: leitor de tela (NVDA no Windows, VoiceOver no iPhone, TalkBack no Android), zoom de 200%, só teclado, e a lista de problemas encontrados
- [ ] Aparelhos reais: Android de entrada, iPhone, computador da escola (navegador e rede da escola, que pode bloquear sites)
- [ ] Carga: 35 alunos ao mesmo tempo numa turma, e uma simulação de escola com 1.250 alunos
- [ ] Teste do fim do contrato: a rotina transforma os alunos em gratuitos sem perder o histórico

## 9. Jurídico e LGPD (🟠 com 🟣)

O público é quase todo menor de idade; isto precisa estar pronto antes do primeiro aluno entrar.

- [ ] Termos de uso
- [ ] Política de privacidade (o que é coletado, para quê, por quanto tempo, com quem é compartilhado: Supabase, Vercel, Resend)
- [ ] Contrato com a escola, incluindo quem é controlador e quem é operador dos dados dos alunos
- [ ] Verificar se precisa de autorização dos responsáveis e como colher (via escola ou no cadastro)
- [ ] Encarregado de dados (DPO) e um canal para pedidos dos titulares
- [ ] Relatório de impacto à proteção de dados (recomendado para dados de adolescentes)
- [ ] Nota fiscal e forma de cobrança da escola (fora do sistema no MVP)

## 10. Piloto (🟢 com 🟣 e 🔵, pacote P8)

- [ ] Cadastrar a escola, o contrato, os professores e a coordenação em produção
- [ ] Treinar os professores (guia rápido e uma conversa curta)
- [ ] Teste com uma turma real antes de abrir para todas
- [ ] Canal de suporte para professores durante o piloto
- [ ] Coletar retorno de alunos e professores (sem rastreador: conversa, formulário da escola)
- [ ] Corrigir o que aparecer, durante as 4 a 6 semanas
- [ ] Avaliar o piloto pelos critérios de D9

## 11. Depois do piloto (opcional, pacote P9)

- [ ] Manutenção mensal: correções, atualização de dependências e de segurança

---

## Ordem sugerida

1. **Agora, em paralelo:** decisões que faltam (D1b e D3 a D9, 🟣), jurídico (seção 9, 🟠) e design das telas que faltam (seção 1).
2. **Assim que D3 sair** (D1 e D2 já decididas): ajustar o banco, criar os projetos no Supabase e publicar o app na Vercel (seções 3 e 7). A revisão de segurança (D7) pode correr junto.
3. **Com o banco no ar:** ligar o app (seção 4), depois as telas do aluno (seção 5).
4. **Em seguida:** telas do professor e da coordenação (seção 6).
5. **Antes do piloto:** testes da seção 8, conteúdo final (seção 2) carregado em produção e documentos da seção 9 publicados.
6. **Piloto** (seção 10).

## Fora do MVP (não fazer agora)

Pontos, ranking, resumo de leis por IA, tela de administração de conteúdo, plano pago e cobrança no sistema, cadastro aberto ao público, app nativo, os jogos além do Voto às Cegas.
