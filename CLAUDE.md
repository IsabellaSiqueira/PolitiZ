# politiQ · contexto para o Claude Code

Plataforma web de educação política para alunos do Ensino Médio, vendida para escolas. O aluno faz trilhas de aulas com quiz e joga o **Voto às Cegas**: lê um projeto de lei real, aprova, rejeita ou pula, e só depois descobre autor e partido. Professor e coordenação acompanham a turma por um painel.

Dona do produto: Isabella (Isa). Ela faz o design no Figma e decide o conteúdo. Escreva sempre em português do Brasil e **nunca use travessão (—)** em nenhum texto: interface, commits, comentários ou README.

Leia também `AGENTS.md` (avisos sobre esta versão do Next.js) e `README.md`.

## Documento de referência

Tudo segue o documento **"politiQ · Proposta de desenvolvimento do MVP"**: https://claude.ai/artifact/HgXYneyGd2raPrpqpxEZvG
Em caso de dúvida entre o código atual e o documento, vale o documento. A Isa ainda vai mandar o **script SQL do Supabase** e o **documento de requisitos** (33 RF, 13 RNF, 33 regras de negócio). Não invente nomes de tabelas ou funções do banco antes de recebê-los.

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
- O frontend não grava direto nas tabelas: chama funções do banco (RPC) como `entrar_na_turma`, `responder_questao`, `registrar_decisao`, `painel_indicadores`.

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
- **Elementos gráficos:** `Etiqueta` (maiúsculas, inclinada 2 graus), `MarcaTexto` (uma vez por tela), `Carimbo` (revelação do Voto às Cegas). No máximo três na mesma composição. Papel rasgado, rabiscos, coroa e foto em preto e branco da colagem ainda não estão no código: as peças precisam ser exportadas do Figma (o ambiente remoto não alcança figma.com). Colagem só em abertura, capas, cards de jogos e revelação; nunca em formulários, aulas ou perguntas do quiz.
- **Aprovo e Rejeito** são dois `BotaoSecundario` lado a lado: mesmo tamanho, mesma cor, mesmo lugar. O carimbo é igual para os dois.
- **Foco de teclado:** contorno azul de 3px afastado do elemento. Respeitar "reduzir movimento".
- **Voz:** frases de até 20 palavras, números em algarismos, sem travessão, pessoas e lugares concretos em vez de lados políticos.
- Telas pensadas para 390px de largura (máx. 430px); conferir também em 320px.

## Como trabalhar

- Rodar: `npm install` e `npm run dev`. Antes de entregar: `npm run lint` e `npm run build`.
- Teste local sem internet: `CAMARA_API_URL` aponta a integração para um servidor que imite a API da Câmara.
- **Testes:** ainda não há suíte no repositório. Nas sessões anteriores os fluxos foram conferidos com Playwright em 390x844, incluindo a checagem de que nenhum "aprov"/"rejeit" aparece em localStorage, sessionStorage ou requisições de rede. Criar essa suíte de verdade (pacote P7 do documento) é um bom próximo passo.
- Commits em português, mensagens descritivas. O repositório é https://github.com/IsabellaSiqueira/PolitiZ (o ramo `versao-antiga` guarda o código anterior).

## Próximos passos

1. Receber o script SQL e o documento de requisitos; ligar Supabase (Auth, turmas, progresso) usando as funções RPC do banco.
2. Telas do aluno que faltam: cadastro, login, aceite dos termos, entrada na turma, vidas e limites do usuário gratuito.
3. Painel do professor e da coordenação.
4. Decidir com a Isa a fonte das leis (Câmara ao vivo ou cadastro no Supabase com resumo da equipe).
5. Suíte de testes de ponta a ponta e de acessibilidade.
