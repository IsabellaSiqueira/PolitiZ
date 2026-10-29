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
| `/voto` | Voto às Cegas: julga a lei, depois revela autoria e partido |
| `/perfil` | Temas que a pessoa mais aprovou |
| `/ferramentas` | Ferramentas liberadas, em breve e bloqueadas |

## Onde está cada coisa

- `src/data/trilha.ts`: aulas e perguntas
- `src/data/leis.ts`: leis do Voto às Cegas (autores e partidos fictícios, marcados como exemplo ilustrativo na tela)
- `src/lib/progresso.tsx`: pontos, aulas feitas e votos, salvos no navegador (localStorage)
- `src/components/ui.tsx`: componentes do sistema visual (manchete, régua, janela, botão, selo, navegação)
- `src/app/globals.css`: cores, espessuras de borda, foco de teclado e animações

## Sistema visual

- **Cores com papel fixo:** azul é o fundo da marca, amarelo é ação e progresso, limão é estado, rosa é o documento e o que foi revelado, papel e tinta são o conteúdo.
- **Bordas:** 2,5px com sombra só no que é tocável (e a sombra some ao pressionar), 2px na janela do documento, 1,5px nas linhas de estrutura.
- **Tipografia:** Archivo para a marca e a leitura, IBM Plex Mono só para metadados (número da lei, contagens, rótulos).
- **Movimento:** respeita "reduzir movimento" do sistema.

## Próximos passos

- Login e progresso salvo no Supabase
- Conteúdo real das leis vindo das APIs da Câmara e do Senado
- Telas do Auditor de Contradições e das ferramentas bloqueadas
