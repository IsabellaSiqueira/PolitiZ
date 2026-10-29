# politiQ

Política brasileira do zero: trilhas de quiz, o Voto às Cegas e um perfil de prioridades.

## Rodar no computador

```bash
npm install
npm run dev
```

Abra http://localhost:3000. O app é pensado para celular (até 430px de largura).

## Telas

| Rota | O que faz |
| --- | --- |
| `/` | Trilha do módulo 01, com as aulas liberadas em sequência |
| `/quiz/[aula]` | Quiz da aula, com correção e explicação de cada pergunta |
| `/voto` | Voto às Cegas com projetos de lei reais da Câmara: julga a lei, depois revela autoria e partido |
| `/api/autoria/[id]` | Revela autor e partido de uma lei, chamada só depois do voto |
| `/perfil` | Temas que a pessoa mais aprovou |
| `/ferramentas` | Ferramentas liberadas, em breve e bloqueadas |

## Onde está cada coisa

- `src/data/trilha.ts`: aulas e perguntas
- `src/lib/camara.ts`: integração com a API de Dados Abertos da Câmara (leis recentes e autoria, com cache)
- `src/data/leis.ts`: leis de exemplo, usadas só quando a Câmara não responde (autores fictícios, marcados na tela)
- `src/lib/progresso.tsx`: pontos, aulas feitas e votos, salvos no navegador (localStorage)
- `src/components/ui.tsx`: componentes do sistema visual (manchete, régua, janela, botão, selo, navegação)
- `src/app/globals.css`: cores, espessuras de borda, foco de teclado e animações

## Voto às Cegas com dados reais

- **Quais leis aparecem:** os 10 projetos de lei (PL) mais recentes da Câmara, por ordem de cadastro. É um critério mecânico de propósito: o app não escolhe a dedo.
- **Sem espiar antes:** autor e partido não vão para o aparelho junto com a lei. São buscados por `/api/autoria/[id]` só depois do voto.
- **Partido:** é o partido atual do autor (a Câmara informa o último status do deputado), e a tela diz isso.
- **Se a Câmara cair:** o app usa as leis de exemplo e avisa "exemplo ilustrativo". A busca acontece no acesso, não no build, então um deploy nunca quebra por causa da API.
- **Cache:** lista de leis por algumas horas, autoria por dias.
- **Teste local sem internet:** defina `CAMARA_API_URL` apontando para um servidor que imite a API.

## Sistema visual

- **Cores com papel fixo:** azul é o fundo da marca, amarelo é ação e progresso, limão é estado, rosa é o documento e o que foi revelado, papel e tinta são o conteúdo.
- **Bordas:** 2,5px com sombra só no que é tocável (e a sombra some ao pressionar), 2px na janela do documento, 1,5px nas linhas de estrutura.
- **Tipografia:** Archivo para a marca e a leitura, IBM Plex Mono só para metadados (número da lei, contagens, rótulos).
- **Movimento:** respeita "reduzir movimento" do sistema.

## Próximos passos

- Login e progresso salvo no Supabase
- Resumo em linguagem simples das ementas oficiais (hoje a tela mostra o texto oficial)
- Projetos do Senado
- Telas do Auditor de Contradições e das ferramentas bloqueadas
