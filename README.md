# politiQ

Política brasileira do zero: trilhas de aulas com quiz e o Voto às Cegas. Segue o documento "politiQ · Proposta de desenvolvimento do MVP".

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O app é pensado para celular (até 430px de largura).

## Testes

```bash
npx playwright install chromium
npm test
```

A suíte (`tests/e2e`) sobe o app em modo produção ligado a uma Câmara simulada (`tests/camara-simulada.mjs`), então não precisa de internet. Ela confere as regras do MVP, como "o voto nunca é gravado", e a acessibilidade de todas as telas (axe, WCAG 2.1 AA). Roda também no GitHub a cada envio.

## Telas

| Rota | O que faz |
| --- | --- |
| `/` | Início: saudação, busca nas aulas, temas e o quiz do dia (ou a primeira aula, para quem está começando) |
| `/trilhas` | Trilha do módulo 01, com as aulas liberadas em sequência |
| `/aula/[aula]` | Texto da aula e "marcar como concluída" |
| `/quiz/[aula]` | Quiz da aula (depois da leitura), com correção e explicação; pode ser refeito |
| `/voto` | Voto às Cegas: sessão de 15 leis; aprova, rejeita ou pula; autoria e partido só depois da decisão |
| `/criterio` | Página pública com o critério de seleção das leis |
| `/api/autoria/[id]` | Revela autor e partido de uma lei, chamada só depois do voto |
| `/perfil` | Progresso: aulas concluídas, histórico de quizzes e número de decisões (nunca o voto) |
| `/jogos` | Jogos liberados, em breve e bloqueados (`/ferramentas` redireciona para cá) |

## Onde está cada coisa

- `src/data/trilha.ts`: aulas e perguntas
- `src/lib/camara.ts`: integração com a API de Dados Abertos da Câmara (leis recentes e autoria, com cache)
- `src/data/leis.ts`: leis de exemplo, usadas só quando a Câmara não responde (autores fictícios, marcados na tela)
- `src/lib/progresso.tsx`: aulas concluídas, tentativas de quiz e leis já decididas, salvos no navegador (localStorage) até o Supabase entrar
- `src/components/ui.tsx`: componentes do sistema visual (logo, título, régua, cartão, botões, campo, alternativa do quiz, etiqueta, marca-texto, carimbo, navegação)
- `src/app/globals.css`: cores, escala tipográfica, foco de teclado e animações

## Regras do MVP que o código já cumpre

- **O voto nunca é gravado.** Do Voto às Cegas o app guarda só o id da lei decidida, nunca se foi aprovar ou rejeitar. O voto existe apenas na memória da tela, para mostrar o selo, e não é enviado ao servidor: a rota de autoria recebe só o id. Dados de versões antigas que guardavam votos são apagados ao abrir o app.
- **Sem pontos nem ranking** (fora do MVP).
- **Sessão de 15 leis:** pular não conta e a lei volta no fim; lei decidida não volta.
- **Sem rastreadores de terceiros:** as fontes são servidas pelo próprio app.

Ainda dependem do Supabase (script SQL e documento de requisitos): login, entrada na turma por código, papéis, vidas e limites do usuário gratuito, painel do professor e da coordenação.

## Voto às Cegas com dados reais

- **Quais leis aparecem:** os 15 projetos de lei (PL) mais recentes da Câmara, por ordem de cadastro. É um critério mecânico de propósito: o app não escolhe a dedo.
- **Sem espiar antes:** autor e partido não vão para o aparelho junto com a lei. São buscados por `/api/autoria/[id]` só depois do voto.
- **Partido:** é o partido atual do autor (a Câmara informa o último status do deputado), e a tela diz isso.
- **Se a Câmara cair:** o app usa as leis de exemplo e avisa "exemplo ilustrativo". A busca acontece no acesso, não no build, então um deploy nunca quebra por causa da API.
- **Cache:** lista de leis por algumas horas, autoria por dias.
- **Teste local sem internet:** defina `CAMARA_API_URL` apontando para um servidor que imite a API.

## Sistema visual

Segue o Manual de identidade v1 (Figma, outubro de 2026).

- **Fundo branco** e quatro cores com função: azul em ações e destaques, amarelo em etiquetas, marca-texto e no botão principal, tinta nos textos e contornos.
- **Tipografia:** só Plus Jakarta Sans, servida pelo próprio app. A personalidade vem do peso ExtraBold e do espaçamento apertado.
- **Componentes:** botão principal amarelo (um por tela), botão secundário com contorno, campo, alternativas do quiz em quatro estados, cartões de cantos arredondados e barra de abas.
- **Elementos gráficos:** etiqueta inclinada, marca-texto e carimbo. Colagem nas capas e cards: foto documental em preto e branco com a borda rasgada do manual (`FotoRasgada`) e as peças de papel rasgado, rabisco e coroa (`Peca`), exportadas do Figma.
- **Movimento:** respeita "reduzir movimento" do sistema.

## Próximos passos

- Login, turmas e progresso no Supabase, usando as funções do banco (`entrar_na_turma`, `responder_questao`, `registrar_decisao`, `painel_indicadores`)
- Painel do professor e da coordenação
- Resumos das leis escritos pela equipe, cadastrados no Supabase (hoje a tela mostra a ementa oficial)
- Projetos do Senado
- Telas do Auditor de Contradições e das ferramentas bloqueadas
