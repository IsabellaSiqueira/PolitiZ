# politiQ · contexto para o Claude Code

Plataforma web de educação política para alunos do Ensino Médio, vendida para escolas. O aluno faz trilhas de aulas com quiz e joga o **Voto às Cegas**: lê um projeto de lei real, aprova, rejeita ou pula, e só depois descobre autor e partido. Professor e coordenação acompanham a turma por um painel.

Dona do produto: Isabella (Isa). Ela faz o design no Figma e decide o conteúdo. Escreva sempre em português do Brasil e **nunca use travessão (—)** em nenhum texto: interface, commits, comentários ou README.

Leia também `AGENTS.md` (avisos sobre esta versão do Next.js) e `README.md`.

## Documento de referência

Tudo segue o documento **"politiQ · Proposta de desenvolvimento do MVP"**: https://claude.ai/artifact/HgXYneyGd2raPrpqpxEZvG
Em caso de dúvida entre o código atual e o documento, vale o documento. O **banco do Supabase** foi escrito nesta base a pedido da Isa: `supabase/` (migração, seed e 104 testes; ver `supabase/README.md`, que lista tabelas, funções e as decisões tomadas). O **documento de requisitos** (33 RF, 13 RNF, 33 regras de negócio) ainda não chegou: quando chegar, confira o banco contra ele. Não crie tabela ou função nova sem passar pela migração e pelos testes do banco.

## Regras inegociáveis (seção 5 do documento)

1. **O voto nunca é gravado.** Nem no banco, nem em log, analytics, Sentry, localStorage ou mensagem de erro. Registra-se só QUE houve uma decisão (id da lei). As palavras aprovou/rejeitou não podem sair da memória da tela. Existe um teste para isso (ver "Testes").
2. **Isolamento entre escolas e controle por papel no banco** (RLS), não só na interface.
3. **LGPD:** público quase todo menor de idade. Coletar só o necessário, nenhum rastreador de terceiros (por isso as fontes são servidas pelo próprio app via `@fontsource`).
4. **WCAG 2.1 AA:** teclado, foco visível, contraste, leitor de tela, alvos tocáveis de 44px ou mais.
5. Funciona no celular do aluno e no computador da escola, sem instalação.
6. Turma de ~35 alunos simultâneos sem lentidão; escola de até 1.250 alunos sem mudar a arquitetura.

**Fora do MVP:** pontos, ranking, resumo de leis por IA, tela de administração de conteúdo, plano pago, app nativo. O design é da Isa.

## Comportamentos do MVP

- **Aula:** texto da aula, "marcar como concluída", depois o quiz (com explicação após cada resposta, pode ser refeito, histórico de tentativas). Aulas liberam em sequência.
- **Voto às Cegas:** sessão de 15 leis com posição na tela ("3 de 15"). Aprovar, rejeitar ou pular. Pular não conta e a lei volta no fim. Lei decidida não volta. Autor e partido aparecem logo após a decisão, com link para o texto oficial.
- **Página pública** com o critério de seleção das leis (`/criterio`).
- **Papéis (ainda não implementados, dependem do Supabase):** aluno escolar (entra na turma com código de 8 caracteres), usuário gratuito (ex-aluno: 5 vidas por dia no quiz, 5 decisões por dia, recarga à meia-noite de Brasília), professor (turmas, código, painel com 4 indicadores, progresso por aula, desempenho por aluno, questões com mais erro, CSV; nunca vê o voto, só a contagem), coordenação (painel de todas as turmas, encerra matrícula), administração (sem tela; cadastro direto no Supabase).
- O frontend não grava direto nas tabelas: chama funções do banco (RPC) como `entrar_na_turma`, `responder_questao`, `registrar_decisao`, `painel_indicadores` (lista completa em `supabase/README.md`). O banco nega escrita direta e esconde gabarito e autoria até o momento certo.

## Stack e decisões

- **Next.js 16 (App Router) + TypeScript + Tailwind 4**, hospedagem na Vercel. O documento sugeria React + Vite; ficou Next porque a revelação da autoria precisa de uma rota no servidor (ver abaixo). `cacheComponents` está ligado: leia `node_modules/next/dist/docs/` antes de mexer em cache, rotas ou dados.
- **Supabase** (Auth com e-mail e senha, RLS, pg_cron) entra no lugar do `localStorage` de `src/lib/progresso.tsx`. Hoje o progresso fica só no navegador.
- **Leis:** hoje vêm da API de Dados Abertos da Câmara (`src/lib/camara.ts`): os 15 PLs mais recentes por id, critério mecânico de propósito. O documento prevê leis cadastradas no Supabase com resumo escrito pela equipe; **pergunte à Isa** antes de trocar a fonte. Se a Câmara falhar, o app usa `src/data/leis.ts` (exemplos fictícios, marcados "Exemplo ilustrativo"). A busca acontece no acesso (`connection()`), não no build.
- **Autoria escondida até a decisão:** a lista de leis vai ao aparelho sem autor/partido (`LeiCartao` em `src/lib/tipos.ts`). Autor e partido vêm de `GET /api/autoria/[id]`, chamada só depois da decisão e que recebe apenas o id. O partido mostrado é o atual do deputado, e a tela diz isso.
- Textos das aulas em `src/data/trilha.ts` são **provisórios**; o conteúdo final é da Isa. Ao escrever conteúdo educacional, explique todo termo técnico na primeira vez que aparecer.

## Sistema visual (Manual de identidade v1, outubro de 2026)

Fonte da verdade: o manual no Figma, https://www.figma.com/design/izkGoAQyBueKwjQLeaHRFY/politiQ-%C2%B7-Startup-One?node-id=348-17 (14 páginas: essência, combinados, logo, cores, tipografia, elementos gráficos, colagem, componentes, voz e tom, aplicações). Tokens em `src/app/globals.css`, componentes em `src/components/ui.tsx`. Não redesenhar sem pedido da Isa.

- **Fundo sempre branco.** Nada de bege, creme ou papel envelhecido.
- **Quatro cores com função:** azul `#3346FF` em ações, links, o Q do logo e destaques (não em texto corrido); amarelo `#FFD43B` em etiquetas, marca-texto e no botão principal (nunca texto amarelo sobre branco); tinta `#171717` em textos, títulos e contornos; branco `#FFFFFF` no fundo. Apoio: suave `#6B6760` (texto secundário), linha `#E3DFD5` (divisórias e contornos), claro `#F1F3FF` (fundo de destaque), erro `#D92D20`. Não introduza gradientes nem cores novas.
- **Tipografia:** uma família só, Plus Jakarta Sans (servida por `@fontsource`). Escala em utilitários: `t-display` (ExtraBold 48, -5%), `t-titulo` (ExtraBold 24 a 32, -3%), `t-subtitulo` (Bold 18 a 20), `t-corpo` (Regular 16, entrelinha 150%), `t-rotulo` (ExtraBold 11, maiúsculas, +10%), `t-anotacao` (ExtraBold Italic azul, no lugar da letra de mão).
- **Logo:** `politiQ` em ExtraBold, espaçamento apertado, Q em azul (`Logo`). Sem acento, p minúsculo, Q maiúsculo, inclusive no começo da frase.
- **Componentes:** `BotaoPrincipal` (amarelo, pílula, seta; **um por tela**), `BotaoSecundario` (contorno tinta, fundo branco), `LinkTexto`, `Campo` (rótulo em cima, borda fina, foco azul), `OpcaoQuiz` (padrão, marcada, certa, errada; certa e errada sempre com ícone), `Cartao` (contorno linha, cantos de 16px), `Titulo`, `Regua`, barra de abas `Navegacao`.
- **Elementos gráficos:** `Etiqueta` (maiúsculas, inclinada 2 graus), `MarcaTexto` (uma vez por tela), `Carimbo` (revelação do Voto às Cegas). No máximo três na mesma composição. Colagem: `FotoRasgada` (foto em preto e branco, granulada, com a borda rasgada do manual em `public/colagem/mascara-foto.png`) e `Peca` (papel azul, papel amarelo, rabisco azul, rabisco preto e coroa, exportados do Figma em `src/assets/colagem`). Fotos já tratadas em `src/assets/fotos` (prédios e lugares públicos de Brasília enviados pela Isa; sem rosto de político, símbolo de partido ou manifestação). Hoje a colagem aparece na capa da trilha, no cartão do Início e no card do jogo liberado. Os ícones ainda são redesenhados em `src/components/icones.tsx`, no traço dos ícones do manual. Para exportar do Figma: o download direto de `www.figma.com` é bloqueado no ambiente remoto, mas `get_screenshot` com `enableBase64Response` grava o PNG (com transparência) em disco. Colagem só em abertura, capas, cards de jogos e revelação; nunca em formulários, aulas ou perguntas do quiz.
- **Aprovo e Rejeito** são dois `BotaoSecundario` lado a lado: mesmo tamanho, mesma cor, mesmo lugar. O carimbo é igual para os dois.
- **Foco de teclado:** contorno azul de 3px afastado do elemento. Respeitar "reduzir movimento".
- **Voz:** frases de até 20 palavras, números em algarismos, sem travessão, pessoas e lugares concretos em vez de lados políticos.
- Telas pensadas para 390px de largura (máx. 430px); conferir também em 320px.

## Como trabalhar

- Rodar: `npm install` e `npm run dev`. Antes de entregar: `npm run lint` e `npm run build`.
- Teste local sem internet: `CAMARA_API_URL` aponta a integração para um servidor que imite a API da Câmara.
- **Banco:** `npm run banco:testar` aplica migração e seed num PostgreSQL limpo (`BANCO_URL`, padrão local) e roda os testes de `supabase/testes`. Mudou `src/data`? Rode `npm run banco:seed`. Toda regra nova do banco ganha um teste ali.
- **Testes:** `npm test` roda a suíte Playwright (`tests/e2e`, 390x844) contra o app em modo produção, apontando para a Câmara simulada de `tests/camara-simulada.mjs`. Cobre: o voto nunca é gravado nem enviado (storage, cookies, requisições, console), autoria fora do HTML até a decisão, sessão de 15 com pular e lei decidida, mesmo peso visual de Aprovo e Rejeito, sequência de aulas, quiz e histórico, busca, axe WCAG 2.1 AA em todas as telas, alvos de 44px, 320px sem rolagem lateral, voto pelo teclado e nenhuma requisição a terceiros. Roda também no GitHub Actions (`.github/workflows/testes.yml`). Toda tela nova entra na lista `telas` de `tests/e2e/acessibilidade.spec.ts`. `@playwright/test` e `playwright-core` ficam fixos na versão do Chromium da máquina (1.63.0); ao atualizar um, atualize o outro.
- Commits em português, mensagens descritivas. O repositório é https://github.com/IsabellaSiqueira/PolitiZ (o ramo `versao-antiga` guarda o código anterior).

## Próximos passos

1. Criar os projetos no Supabase, aplicar `supabase/migrations` e ligar o app (Auth, turmas, progresso) usando as funções RPC do banco. Conferir o banco contra o documento de requisitos quando ele chegar.
2. Telas do aluno que faltam: cadastro, login, aceite dos termos, entrada na turma, vidas e limites do usuário gratuito.
3. Painel do professor e da coordenação.
4. Decidir com a Isa a fonte das leis (Câmara ao vivo ou cadastro no Supabase com resumo da equipe).
5. Testes de leitor de tela feitos por pessoas (NVDA e VoiceOver) e testes das telas novas conforme forem criadas.
