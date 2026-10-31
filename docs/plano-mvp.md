# politiQ · O que falta para concluir o MVP

Lista de tudo o que precisa acontecer para o MVP rodar no piloto pago em 1 ou 2 escolas, conforme o documento "politiQ · Proposta de desenvolvimento do MVP". Marque `[x]` ao concluir, no mesmo commit da entrega.

**Quem faz:** 🟣 Isa (decisão, conteúdo, design) · 🔵 desenvolvimento · 🟠 jurídico/contador · 🟢 escola piloto

Situação em 31/10/2026 (atualizada com as respostas da Isa ao PRD): o app roda só no navegador (progresso no `localStorage`), com o sistema visual do manual, as telas do aluno sem login e testes automáticos. O banco do Supabase está escrito e testado, mas não está no ar nem ligado ao app.

---

## 0. Decisões que travam o resto

Sem estas respostas, partes grandes não podem começar. Em ordem de urgência. Cada decisão em aberto traz uma **recomendação** (31/10/2026) para a Isa aprovar ou mudar.

- [x] 🟣 **D1. Fonte das leis do Voto às Cegas:** opção B (31/10/2026). Leis escolhidas pela equipe, com resumo próprio, cadastradas no banco. O app mostra o resumo; a ementa oficial e o link ficam como apoio.
- [x] 🟣 **D1b. Critério de seleção das leis** aprovado (31/10/2026) como está em `docs/criterio-leis.md`, com sorteio pela Mega-Sena e correções pelo e-mail `leis@` do domínio. Era, para a página pública `/criterio`: quem escolhe, com que regras (temas, equilíbrio entre partidos e regiões, só projetos em tramitação ou também aprovados) e de quanto em quanto tempo entram leis novas. Junto: quantas leis o piloto precisa ter no ar (cada sessão tem 15, e quem decide todas fica sem leis novas).
- [x] 🟣 **D2. As 5 decisões do banco aprovadas** (31/10/2026): aluno sem turma conta como gratuito; trocar de turma exige a coordenação; arquivar turma só desliga o código; professor vê o nome dos alunos; leis cadastradas no banco.
- [x] 🟣 **D3. Mandar o documento de requisitos**: chegaram o PRD MVP v1.5 e o Tech Brief v1.6. A comparação item por item está em `docs/divergencias-prd.md` e virou a decisão D12. (33 RF, 13 RNF, 33 RN, glossário). Tudo abaixo foi deduzido do documento do MVP; o de requisitos pode acrescentar ou mudar regras.
  - **Recomendação:** se o documento já existe, mandar como está, mesmo desatualizado: o desenvolvimento confere item por item contra o banco e as telas e devolve a lista do que diverge. Se não existe, não escrever um do zero agora: `supabase/README.md`, `docs/criterio-leis.md` e este plano já funcionam como especificação. Nesse caso, o desenvolvimento junta esses três num documento curto de requisitos para a Isa revisar, em vez de ela escrever.
- [x] 🟣 **D4. Tamanho do conteúdo no piloto** (aprovada: 2 módulos de 4 aulas), com a regra de que **toda questão passa por revisão de conteúdo antes de chegar a alunos**. O banco já só entrega questão revisada (`revisada_por`, `revisada_em`). quantos módulos e aulas precisam estar prontos no primeiro dia, e em que ritmo entram os outros.
  - **Recomendação:** 2 módulos de 4 aulas (8 aulas, cada uma com 4 ou 5 questões). O módulo 01, "Quem manda em quê?", pronto e revisado no primeiro dia; o módulo 02 no ar até o fim da semana 2. Num piloto de 6 semanas com cerca de 1 aula por semana, 8 aulas cobrem o período com folga, e o ritmo de escrita fica viável para a equipe junto com os 15 resumos de lei a cada 2 semanas. Sugestão para o módulo 02: "Como uma lei nasce", que prepara direto para o Voto às Cegas.
- [x] 🟣 **D5. Aba Jogos** (aprovada e feita): só o Voto às Cegas e "Mais jogos chegam ao longo do ano". Era: Hoje ela lista o Voto às Cegas e 4 jogos "em breve" e "bloqueado" que estão fora do MVP. Manter assim, esconder os futuros, ou voltar ao nome "Ferramentas"?
  - **Recomendação:** manter o nome "Jogos" (é o do manual) e mostrar só o Voto às Cegas, com uma linha "Mais jogos chegam ao longo do ano". Tirar os 4 nomes futuros: estão fora do MVP, ainda não têm desenho, viram promessa para a escola que paga o piloto, e um nome como "Auditor de Contradições" pode soar como tomada de lado antes de o jogo existir.
- [x] 🟣 **D6. Início** (aprovada com ajuste e feita): saiu a fileira de temas e entrou "continue de onde parou" com o progresso da trilha; vidas **não** aparecem no Início. Era: a busca, os temas e o "quiz do dia" ficam? Os temas Economia, Sociedade e Meio ambiente aparecem como "em breve".
  - **Recomendação:** ficam a saudação (com o nome, depois do login), a busca nas aulas e o cartão do dia (quiz do dia ou próxima aula). Sai a fileira de temas: com 3 dos 4 temas "em breve", ela mostra mais o que falta do que o que existe. No lugar, entram os contadores de vidas e decisões do usuário gratuito, que o manual já desenha no topo. Os temas voltam quando houver um módulo por tema.
- [x] 🟣 **D7. Revisão de segurança do banco** (aprovada: pacote fechado, pessoa independente, depois de D12 e antes do primeiro aluno real). Era: O documento pede alguém experiente; o banco foi escrito nesta base. Uma revisão independente antes de receber dados de menores é recomendada.
  - **Recomendação:** contratar só o P1, por pacote fechado, com uma pessoa que já trabalhou com Supabase e RLS em produção, e que não seja quem vai programar o resto (para a revisão ser de fato independente). Escopo: ler a migração e os testes, conferir as políticas, as funções `security definer`, a configuração do Auth e o painel "Security Advisor" do Supabase, e entregar um relatório curto com o que corrigir. Fazer depois de D3 (para revisar a versão final) e antes do primeiro aluno real.
- [x] 🟣 **D8. Sem Sentry no piloto** (aprovada), com a exigência de que **os logs da Vercel e do Supabase não registrem o conteúdo das respostas** (itens na seção 7). Era: usar o Sentry (está no documento) com coleta mínima e sem gravação de sessão, ou ficar sem ele no piloto? Ele é um serviço de terceiros recebendo dados de menores.
  - **Recomendação:** ficar sem o Sentry no piloto. Com 1 escola e um canal direto com os professores, os registros da Vercel e do Supabase bastam, sem mandar dados de adolescentes a mais um serviço e sem uma linha a mais na política de privacidade. Para os erros serem fáceis de relatar, a tela de erro mostra um código curto que o professor repassa ao suporte. Reavaliar depois do piloto, quando o número de escolas crescer.
- [x] 🟣 **D9. Escola piloto** (formato aprovado): 1 escola, 2 ou 3 turmas, 6 semanas, começando em **fevereiro ou março de 2027**, só depois do jurídico pronto. A mesma escola também testa o **kit físico do Plenário**. Falta escolher a escola e combinar os critérios de sucesso. Era: qual, quantas turmas, quantos alunos, professores e coordenação, data de início e duração (o documento fala em 4 a 6 semanas), e o que conta como piloto bem-sucedido.
  - **Recomendação:** 1 escola, 2 ou 3 turmas do 1º ou 2º ano (de 70 a 105 alunos), 1 ou 2 professores de Sociologia, Filosofia ou História que queiram participar, e 1 pessoa da coordenação que acompanhe. A escola precisa de internet que alcance o site e de celulares ou laboratório. Duração de 6 semanas, começando só depois de a seção 9 (jurídico) estar pronta. Combinar com a escola, antes de começar, o que conta como sucesso, por exemplo: pelo menos 60% dos alunos ativos por semana; a turma conclui pelo menos 6 aulas; o professor abre o painel toda semana; nenhum incidente com dados; e, na conversa final, professores e alunos querem continuar.
- [x] 🟣 **D10. Quiz: marcar e confirmar** (aprovada e feita). O motivo é acessibilidade e evitar chute. Era: marcar e confirmar, ou responder no toque? O manual tem o estado "marcada" na alternativa; hoje o app responde no primeiro toque.
  - **Recomendação:** marcar e confirmar (toque na alternativa, depois "Responder"). O passo extra ajuda quem usa leitor de tela ou tem dificuldade motora e evita o chute.
- [x] 🟣 **D11. Juntar este trabalho no ramo principal** (aprovada: pull request aberto). Tudo desta fase está no ramo `claude/leia-esse-git-k3u06s`, e o site, quando for publicado, sai do `main`.
  - **Recomendação:** abrir agora o pull request para o `main`, revisar e juntar. Os testes do app e do banco já rodam no GitHub e estão passando; quanto mais tempo os ramos ficam separados, mais difícil fica juntar.

- [ ] 🟣 **D12. Responder às divergências entre o PRD e o que existe** (`docs/divergencias-prd.md`), começando pela X0: qual é o produto do MVP (curso da FIAP, escola do Ensino Médio, ou os dois). As respostas viram tarefas neste plano.

### Regra das vidas (Isa, 31/10/2026, conforme o protótipo)

Errar no quiz **não** tira vida. As vidas limitam **aulas novas por dia** no plano gratuito (5 por dia, recarga à meia-noite de Brasília). Aluno de turma no piloto não tem esse limite. O banco já segue esta regra.

## 1. Design (🟣 Isa, no Figma)

O manual de identidade e as telas de abertura, início e revelação já existem. Faltam:

- [ ] Tela de abertura completa (o manual mostra "Começar" e "Já tenho uma conta")
- [ ] Cadastro (nome, e-mail, senha) e mensagem "confirme seu e-mail"
- [ ] Login, "esqueci a senha" e nova senha
- [ ] Aceite dos termos (primeiro acesso e quando sair versão nova)
- [ ] Entrar na turma com o código (e os erros: código errado, já está em outra turma, escola sem acesso, muitas tentativas)
- [ ] Vidas (aulas novas por dia) e decisões do usuário gratuito: onde aparecem (fora do Início, pela D6) e as telas de "acabaram por hoje"
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
- [ ] Trocar o texto da página `/criterio` pelo da seção 8 de `docs/criterio-leis.md`, com o e-mail `leis@`, quando o Voto às Cegas passar a usar as leis do banco (antes disso, a página descreveria um critério que o app ainda não usa)
- [ ] Link "Achou um erro neste resumo?" na revelação do Voto às Cegas, abrindo o e-mail com o projeto no assunto (sem guardar nada)
- [ ] E-mails em português: confirmação de conta e redefinição de senha
- [ ] Mensagens de erro de cada código do banco (`sem_vidas`, `escola_lotada` etc.; lista em `supabase/README.md`)
- [ ] Guia rápido para o professor (como criar turma, passar o código, ler o painel)

## 3. Banco e Supabase (🔵, pacotes P1 e P2)

- [x] Esquema, funções, RLS, auditoria e rotina diária (`supabase/migrations`)
- [x] Dados iniciais gerados do app e 112 testes do banco, rodando no GitHub
- [x] Banco ajustado a D1 e D2: lei só vai ao ar com resumo e, se for real, com link oficial
- [x] Banco ajustado à nova regra das vidas (aulas novas por dia) e à revisão obrigatória das questões (D4)
- [ ] Ajustar o banco às respostas da D12
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

- [x] Script do sorteio com cotas, semente, exclusões com motivo, planilha de resumos e geração do SQL (`scripts/leis`, passo a passo em `leis/README.md`), com testes no GitHub
- [ ] 🔵 Primeira busca real na Câmara, conferindo os pontos marcados "A CONFERIR" em `leis/README.md` (precisa de uma máquina que alcance `dadosabertos.camara.leg.br`)
- [ ] 🔵 Busca automática no Senado (hoje entra por planilha), depois de ver respostas reais da API do Senado
- [x] 🟣 Semente do sorteio: resultado do primeiro concurso da Mega-Sena depois de publicada a digital da lista (31/10/2026); o script só aceita esse formato
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
- [x] Quiz com marcar e confirmar (D10)

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
- [ ] 🟣 Criar o e-mail `leis@` no domínio (encaminhamento para a caixa da equipe), para as correções de resumo
- [ ] Projeto na Vercel com deploy automático: `main` vai para produção, pull requests ganham prévia ligada ao banco de teste
- [ ] Variáveis de ambiente de cada ambiente (URL e chave pública do Supabase; nunca a chave de serviço no navegador)
- [ ] Resend com domínio verificado (SPF e DKIM) para os e-mails não caírem no spam
- [ ] Sentry, se aprovado: sem dados pessoais, sem gravação de sessão, e nenhuma mensagem com voto
- [ ] Cabeçalhos de segurança (política de conteúdo, sem embutir o site em outros sites)
- [x] Lint barra `console` no código do app (`eslint.config.mjs`), para nada de resposta ou voto ir aos logs da Vercel
- [ ] Ao ligar o app ao banco: chamar as funções sempre por POST (padrão do `supabase-js`; nunca `{ get: true }`), para os argumentos não irem para a URL, que aparece nos logs da API do Supabase
- [ ] Conferir no banco de produção que `pgaudit` está desligado e `log_statement` está em `none` (padrão), para os argumentos das funções não irem aos logs do PostgreSQL
- [ ] Depois de publicar: fazer uma sessão de teste (quiz e Voto às Cegas) e conferir no Logs Explorer do Supabase e nos logs da Vercel que nenhuma resposta, alternativa marcada ou voto aparece

## 8. Testes (🔵, pacote P7)

- [x] Testes automáticos das telas atuais: regra do voto, sessão de 15, aulas em sequência, quiz, acessibilidade (axe, 44px, 320px, teclado) e nenhuma requisição a terceiros, rodando no GitHub
- [x] Testes do banco (112 casos)
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

- [ ] Piloto em fevereiro ou março de 2027, depois da seção 9 pronta
- [ ] Combinar com a escola o teste do kit físico do Plenário (fora do app, mas no mesmo período)
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

1. **Agora, em paralelo:** decisão D12 (🟣), jurídico (seção 9, 🟠) e design das telas que faltam (seção 1).
2. **Assim que D12 sair:** ajustar o banco, criar os projetos no Supabase e publicar o app na Vercel (seções 3 e 7). A revisão de segurança (D7) pode correr junto.
3. **Com o banco no ar:** ligar o app (seção 4), depois as telas do aluno (seção 5).
4. **Em seguida:** telas do professor e da coordenação (seção 6).
5. **Antes do piloto:** testes da seção 8, conteúdo final (seção 2) carregado em produção e documentos da seção 9 publicados.
6. **Piloto** (seção 10).

## Fora do MVP (não fazer agora)

Pontos, ranking, resumo de leis por IA, tela de administração de conteúdo, plano pago e cobrança no sistema, cadastro aberto ao público, app nativo, os jogos além do Voto às Cegas.
