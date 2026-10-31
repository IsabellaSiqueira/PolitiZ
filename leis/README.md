# Lotes de leis do Voto às Cegas

Aqui ficam as listas de candidatos, os lotes sorteados e o registro de cada sorteio, conforme o critério aprovado em `docs/criterio-leis.md`. Cada lote tem 15 leis. O registro (`registro.json`) mostra a semente, as exclusões com o motivo e a conferência das cotas, e fica disponível para as escolas e para quem pedir.

## Passo a passo de um lote

### 1. Congelar a lista de candidatos

```bash
npm run leis -- candidatos --ate 2026-11-03 --senado leis/senado.csv
```

Busca na Câmara todos os PLs apresentados nos 24 meses anteriores à data e junta os do Senado da planilha (ver "Senado" abaixo). Gera `leis/candidatos/2026-11-03.json` e mostra a **digital da lista**, um código que muda se qualquer candidato for acrescentado ou tirado.

### 2. Publicar a digital e esperar o próximo concurso da Mega-Sena

A semente do sorteio é **o resultado do primeiro concurso da Mega-Sena realizado depois que a digital foi publicada** (decisão de 31/10/2026). Assim ninguém da equipe controla o resultado:

1. publique a digital da lista (por exemplo, envie às escolas), com a data;
2. espere o próximo concurso e use o número dele e as 6 dezenas: `--semente "Mega-Sena 2850: 04 11 23 35 47 58"`.

O script só aceita semente nesse formato (número do concurso e 6 dezenas diferentes de 1 a 60) e guarda no registro sempre do mesmo jeito, com as dezenas em ordem. Qualquer pessoa confere o resultado no site da Caixa e refaz o sorteio.

### 3. Sortear

```bash
npm run leis -- sortear --candidatos leis/candidatos/2026-11-03.json --lote 01 --semente "Mega-Sena 2850: 04 11 23 35 47 58"
```

Na primeira vez, busca os detalhes (situação, tema, autor e partido atual) dos projetos que o sorteio alcança e guarda em `leis/candidatos/2026-11-03.detalhes.json`. Refazer com a mesma semente dá o mesmo lote, mesmo que algum deputado troque de partido depois.

Gera `leis/lotes/01/registro.json` e `leis/lotes/01/resumos.csv`. Saem automaticamente, com o motivo registrado: projetos arquivados ou que já viraram lei, homenagens e datas comemorativas (pela ementa), e leis de lotes anteriores.

### 4. Revisar as sorteadas

Duas pessoas leem as 15 leis contra a seção 3 do critério (cita o autor, caso individual, repete outro projeto, não cabe em 60 palavras, inadequada para a faixa etária). Se alguma deve sair, anote em `leis/exclusoes.csv` (modelo em `leis/modelos/exclusoes.csv`), **sempre com o motivo**, e rode o sorteio de novo com a mesma semente e `--exclusoes leis/exclusoes.csv`. Repita até nenhuma sair.

### 5. Escrever e revisar os resumos

Abra `leis/lotes/01/resumos.csv` no Google Planilhas ou no Excel e preencha `resumo`, `impacto_social` (o "Contexto da lei": quem ganha, quem paga e o que muda na prática, opcional), `escrito_por` e `revisado_por`, seguindo a lista da seção 6 do critério. Sortear de novo não apaga o que já foi escrito.

### 6. Gerar o SQL e publicar

```bash
npm run leis -- sql --lote 01
```

Confere que todo resumo existe, tem até 60 palavras, não tem travessão e foi revisado por outra pessoa. Gera `leis/lotes/01/leis.sql`, que se roda no SQL Editor do Supabase. As leis entram publicadas, e a auditoria do banco guarda qualquer correção posterior.

Faça commit da pasta do lote (lista, detalhes, exclusões, registro, resumos e SQL): é o histórico verificável do sorteio.

## Senado

Os dados abertos do Senado ainda não estão ligados ao script (o ambiente onde ele foi escrito não alcançava o site do Senado, e os campos da API precisam ser conferidos numa resposta real). Até lá, a equipe copia os PLs do Senado que cumprem a seção 2 do critério para `leis/senado.csv` (modelo em `leis/modelos/senado.csv`):

| Coluna | Exemplo |
| --- | --- |
| `id_externo` | código da matéria no site do Senado |
| `rotulo` | `PL 1234/2026` |
| `ementa` | ementa oficial |
| `apresentada_em` | `2026-04-10` |
| `link` | endereço da página da matéria |
| `situacao` | situação atual, como o site mostra |
| `tema` | tema equivalente da classificação da Câmara |
| `autoria` | `Sen. Fulana de Tal` |
| `partido`, `uf` | partido atual e estado do autor |
| `coautores` | número de coautores |
| `link_autor` | página do autor no site do Senado, para o link "Ver votações" (opcional) |

Sem pelo menos 4 projetos do Senado elegíveis, o sorteio avisa que não consegue fechar as cotas.

## A conferir na primeira busca real

- Os filtros de data da Câmara (`dataApresentacaoInicio` e `dataApresentacaoFim`) e o campo de situação no detalhe (`statusProposicao.descricaoSituacao`). Se a busca trouxer projetos fora da janela, ou se nenhum arquivado for excluído, um desses nomes está errado.
- Os nomes dos temas em `scripts/leis/regras.ts` (`temasEstudante`) contra os temas que a Câmara devolve.

## Verificação semanal (Y19)

Toda madrugada de sexta para sábado, o GitHub Actions (`.github/workflows/leis-semanal.yml`) roda `npm run leis -- verificar`: confere a situação de cada lei publicada da Câmara e tira do ar a arquivada ou que já virou lei. O resumo aparece na página da execução. Precisa dos segredos `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no repositório; sem eles, a execução avisa e não faz nada. Leis do Senado ainda são conferidas à mão.

## Testes

```bash
npm run leis:testar
```
