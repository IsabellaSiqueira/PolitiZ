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

## Sistema visual (já aprovado pela Isa, não redesenhar sem pedido)

Neobrutalista com direção editorial. Tokens em `src/app/globals.css`, componentes em `src/components/ui.tsx`.

- **Cada cor tem um papel:** azul `#3346FF` é o fundo da marca; amarelo `#FFD43B` é ação e progresso; limão `#C6F24E` é estado (aba ativa, selo); rosa `#FF9BD2` é o documento e o que foi revelado; papel `#FFFDF7` e tinta `#17150F` são o conteúdo. Não introduza gradientes nem cores novas.
- **Três espessuras de borda:** 2,5px com sombra dura de 4px só no que é tocável (a sombra some ao pressionar: `.btn-acao`); 2px na janela do documento; 1,5px em linhas de estrutura.
- **Tipografia:** Archivo (Black para títulos, SemiBold/Regular para leitura; nunca Black em parágrafo longo) e IBM Plex Mono só para metadados (número da lei, contagens, rótulos).
- **Peças:** `Manchete` (sobretítulo mono amarelo + título em duas vozes + numeral vazado opcional), `Regua` (progresso segmentado), `Janela` (documento com barra rosa e folhas empilhadas), `BotaoAcao`, `Selo` (carimbo redondo do voto), `Navegacao`.
- **Foco de teclado:** contorno amarelo dentro de tinta (padrão GOV.UK). Respeitar "reduzir movimento".
- Aprovo e Rejeito têm sempre o mesmo peso visual: a interface não pode sugerir resposta.
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
