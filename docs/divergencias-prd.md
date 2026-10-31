# Divergências entre o PRD, o Tech Brief e o que já existe

Entrega da decisão D3 (31/10/2026). Compara o **PRD MVP v1.5** e o **Tech Brief v1.6** com:

- a **Proposta de desenvolvimento do MVP** (15/10/2026) e o `CLAUDE.md`;
- as **decisões já tomadas** (D1 a D11 em `docs/plano-mvp.md`, `docs/criterio-leis.md` e a regra nova das vidas);
- o **app e o banco** que estão no repositório.

## Respostas da Isa (31/10/2026)

| Itens | Resposta |
| --- | --- |
| **X0** | O MVP é o produto da Proposta, para escolas do Ensino Médio, com professor, coordenação e usuário gratuito. O PRD entra só como fonte das mecânicas aprovadas abaixo. O curso Política Essencial não faz parte do MVP. |
| **X1 a X8** | Aprovadas como recomendado: nenhum analytics de terceiros; nada de voto, razão ou opinião registrados; sem ranking nem perfil público; produção no plano pago. |
| **Aprovadas** | Y3, Y4, Y6 (mini-jogos depois), Y7, Y8, Y9, Y10, Y11, Y12, Y13, Y14, Y15 a Y17, Y18 (pendente da base legal com o jurídico) e Y19, como recomendado. Y12 usa a tela D9 "Contexto da lei" do protótipo como base. |
| **Depois do piloto** | Y1 (XP e níveis), Y2 (timer) e Y5 (modo revisão). |
| **Y20** | Segue a D4: 2 módulos de 4 aulas para a escola. |
| **Z1 a Z7** | Manter tudo. |
| **W1 a W9** | Listadas em `docs/correcoes-prd.md` para a Isa corrigir os documentos. O app não muda por causa delas. |

As tarefas que saem daqui estão em `docs/plano-mvp.md`, seção "Mecânicas aprovadas na D12".

---

Cada item abaixo tem um código, o que cada lado diz e a recomendação que foi respondida acima.

---

## 0. A pergunta que vem antes de todas

**X0. Qual é o produto do MVP?** Os documentos descrevem dois produtos diferentes:

| | PRD v1.5 e Tech Brief v1.6 | Proposta, decisões e app atual |
| --- | --- | --- |
| Público | Alunos do curso **Política Essencial** (FIAP), que assistem à aula fora do app | Alunos do **Ensino Médio**, numa escola que paga o piloto (fevereiro ou março de 2027) |
| Papel do app | Laboratório da aula: quizzes, glossário e Tinder das Leis | Trilha com a aula escrita no app, quiz e Voto às Cegas |
| Perfis | Visitante e Aluno (código da turma) | Aluno escolar, usuário gratuito, professor, coordenação, administração |
| Módulo 1 | "O que é política?" (democracia, correntes do pensamento) | "Quem manda em quê?" (Três Poderes) |
| Acompanhamento | Não tem professor nem painel | Painel do professor e da coordenação |

**Recomendação:** a Proposta e as decisões recentes definem o público, os papéis e as regras inegociáveis, porque são as mais novas e batem com o piloto marcado. O PRD entra como fonte das mecânicas que você aprovar nas seções 2 e 3. Se os dois pilotos vão existir (curso da FIAP e escola), dá para atender os dois com o mesmo banco, mas isso precisa ser dito, porque muda o escopo.

---

## 1. Conflitos com as regras inegociáveis

Pontos do PRD que, como estão escritos, quebram uma regra do `CLAUDE.md` ou do manual. A recomendação mantém a regra.

| Código | O que o PRD ou o Tech Brief dizem | Regra que conflita | Recomendação |
| --- | --- | --- | --- |
| **X1** | Analytics no **Firebase ou Mixpanel**, com `user_id` em todos os eventos (PRD 6.3, Tech Brief 1) | LGPD: nenhum rastreador de terceiros, público menor de idade; D8 aprovou ficar sem Sentry pelo mesmo motivo | Sem Firebase nem Mixpanel. Os números que importam (TRC, avanço, acerto) saem do próprio banco, em contagens sem identificar o aluno. |
| **X2** | CA-03.8: "o histórico de votos de cada aluno é salvo no perfil dele" | Regra 1: o voto nunca é gravado. O próprio PRD diz o contrário em 4.2 e 5.5 | Tirar o CA-03.8. |
| **X3** | 8.3: histórico de votos no aparelho (`localStorage`), com opt-in | Regra 1 inclui `localStorage`. Em computador de escola, o próximo aluno veria os votos de quem usou antes | Não guardar, nem no aparelho. O teste automático do app já falha se isso acontecer. |
| **X4** | Micro-pergunta "Sua razão principal?" registrada no evento `pl_reason_selected`, com `user_id` e `session_id` | Regra 1: uma razão como "Não faz sentido pra mim" praticamente revela o voto | A micro-pergunta pode existir na tela, como pausa para pensar, mas **não é registrada**, assim como o voto. |
| **X5** | Eventos `pl_swiped` e `pl_external_link_clicked` com `hash(pl_id)` | Com poucas dezenas de leis, o hash se desfaz testando todas; junto com o tempo de tela e a razão, aproxima o voto | Não registrar nada por lei além do que o banco já guarda ("decidiu a lei X"). |
| **X6** | Perfil visível para outros (nome, XP e nível) e ranking opcional (4.4, 5.3, 8.2) | Combinado 06 do manual ("sem ranking entre alunos"); `CLAUDE.md`: pontos e ranking fora do MVP | Sem perfil público e sem ranking no MVP. |
| **X7** | Evento `module_entry_stance` com a resposta Concordo ou Discordo | É uma opinião do aluno | Se a tela de entrada ficar (ver Y8), a resposta só muda a frase de abertura e não é registrada. |
| **X8** | Tudo no plano gratuito, com tarefa agendada para o Supabase não pausar (Tech Brief 5.3, 6) | Dados de menores pedem backup diário, que o plano gratuito não tem | Produção no plano pago (já está no plano do MVP); o teste pode ficar no gratuito. |

---

## 2. Mecânicas do PRD que o app ainda não tem

Para cada uma: entra no MVP do piloto ou fica para depois?

| Código | Mecânica do PRD | Situação hoje | Recomendação |
| --- | --- | --- | --- |
| **Y1** | **XP e 5 níveis**, com avisos rápidos de XP e de nível | Não existe; o `CLAUDE.md` deixa pontos fora do MVP | Depois do piloto. Se entrar, sem ranking (X6) e sem perfil público. |
| **Y2** | **Timer de 3 minutos** por quiz, controlado pelo servidor | Sem timer | Não no piloto: timer pressiona quem lê devagar ou usa leitor de tela (WCAG 2.2.1 pede poder desligar ou estender). Se entrar, com opção de mais tempo. |
| **Y3** | **70% para destravar** o próximo quiz | A próxima aula destrava ao concluir a leitura da anterior | Aprovar, combinando as duas: a próxima aula abre quando a anterior foi lida **e** o quiz dela teve 70% ou mais. |
| **Y4** | Questões e alternativas **embaralhadas** a cada tentativa | Ordem fixa | Aprovar: é barato e evita decorar a posição. |
| **Y5** | **Modo revisão** sem XP ao refazer quiz concluído | Refazer é livre, sem XP (não há XP) | Só faz sentido com Y1. |
| **Y6** | **Glossário**: aba sempre disponível e termos sublinhados que abrem a definição | Não existe; os termos são explicados no texto da aula | Aprovar a aba e o termo sublinhado no MVP. Os **mini-jogos** de glossário com sorteio ponderado (US-01) ficam para depois. |
| **Y7** | **Tinder das Leis**: deslizar para os lados, micro-pergunta de razão e 3 segundos de revelação com a tela travada | Voto às Cegas com botões Aprovo e Rejeito de mesmo peso | Manter os botões (acessíveis e com mesmo peso) e aceitar deslizar como atalho, igual para os dois lados. Micro-pergunta só na tela (X4). Sem travar a tela por 3 segundos: a revelação já fica parada até o aluno tocar em "Próxima lei". |
| **Y8** | **Tela de entrada** com a frase "Todo mundo já votou em algo sem entender…" e Concordo ou Discordo | Não existe | Aprovar, sem registrar a resposta (X7). Combina com a voz do manual ("pergunta mais do que responde"). |
| **Y9** | **Sessão de 7 cartões** (o PRD também diz "entre 5 e 10") | Sessão de 15 leis, já no critério aprovado | Manter 15: o critério de seleção, as cotas do sorteio e o "3 de 15" foram aprovados com esse número. Se preferir 7 ou 10, as cotas precisam ser refeitas. |
| **Y10** | Botão **"Ver votações de [nome] na Câmara"** na revelação | Link para o texto oficial do projeto | Aprovar os dois links, sem registrar o clique (X5). |
| **Y11** | **Modal da TRC** ao fim da sessão (intenção de ação cívica) | Não existe | Aprovar, contando só o total de respostas por opção, sem identificar o aluno (X1). É a métrica principal do PRD. |
| **Y12** | Cartão com **texto de impacto social**, **ementa acessível** e **data da votação** | Lei com resumo da equipe, ementa oficial e link | Aprovar o campo de impacto social. A "data da votação" não existe para projeto em tramitação: usar a data de apresentação. |
| **Y13** | **PWA** instalável na tela inicial | Site comum | Aprovar no MVP: é pouco trabalho e ajuda no celular do aluno. Sem modo offline (o Tech Brief diz que não tem). |
| **Y14** | **Visitante**: sem código de turma, vê o primeiro quiz e poucas leis | Usuário gratuito: 5 aulas novas e 5 decisões por dia | Manter o gratuito (regra que você acabou de confirmar). O Visitante do PRD vira o gratuito. |
| **Y15** | Códigos de turma criados pela equipe, com **limite de usos e validade** | Professor cria a turma e o código | Manter o professor criando. Acrescentar a validade (fim do ano letivo) e o limite de alunos, que o banco já tem por contrato. |
| **Y16** | Código em **Base32 de Crockford**, trocando I e L por 1 e O por 0 | Código sem letras que se confundem | Compatíveis: aceitar as duas formas na digitação. |
| **Y17** | **5 tentativas a cada 10 minutos** no código | 10 por hora | Aprovar o do Tech Brief (mais curto, mais seguro). |
| **Y18** | **Excluir a conta** no perfil, com atividade anonimizada; **consentimento** no cadastro; dados guardados pelo **período do curso mais 12 meses** | Previsto no plano (seção 9), sem tela nem regra no banco | Aprovar os três. Depende da base legal com o jurídico (8.1 do PRD). |
| **Y19** | **Verificação semanal** do status das leis nas APIs, desativando as arquivadas | Não existe | Aprovar, junto com o script do sorteio. |
| **Y20** | **Conteúdo do Módulo 1** "O que é política?" com 5 quizzes, escrito pelos especialistas do curso | 4 aulas provisórias sobre os Três Poderes | Depende de X0. Para a escola, a D4 aprovou 2 módulos de 4 aulas. |

---

## 3. O que existe hoje e o PRD não cobre

Não são conflitos: são partes que o PRD não menciona. Recomendação para todas: **manter**, salvo indicação sua.

| Código | O quê |
| --- | --- |
| **Z1** | Professor, coordenação, painel com 4 indicadores, CSV e encerrar matrícula |
| **Z2** | Escolas, contratos e a rotina que transforma alunos em gratuitos quando o contrato acaba |
| **Z3** | A aula escrita dentro do app, antes do quiz (no PRD a aula acontece fora) |
| **Z4** | Critério público de seleção das leis, com cotas e sorteio pela Mega-Sena. Resolve as pendências "sourcing de PLs" e "protocolo de diversidade" do PRD (8.1 e 8.3) |
| **Z5** | Revisão obrigatória das questões antes de chegarem ao aluno (D4) e do resumo das leis por outra pessoa |
| **Z6** | Auditoria de toda mudança feita pela administração |
| **Z7** | Autor e gabarito escondidos pelo banco até a decisão ou a resposta, e não só pela tela |

---

## 4. Contradições dentro do PRD e do Tech Brief

Para corrigir nos documentos, independente das decisões acima.

| Código | Contradição |
| --- | --- |
| **W1** | Sessão "entre 5 e 10 cartões" (CA-03.6) e "sempre 7 cartões" (4.3, CA-03.8b, Tech Brief 3.5) |
| **W2** | "Sem conexão: cache local, sincroniza depois" (2.3) e "modo offline não suportado" (4.1, Tech Brief 1) |
| **W3** | Histórico de votos salvo no perfil (CA-03.8) e sentido do voto nunca armazenado (4.2, 5.5) |
| **W4** | Glossário "não é etapa da timeline" (1.2, 2.1) e glossário na posição 1 que destrava o próximo item (2.2, CA-01.2, `module_timeline`) |
| **W5** | Foto de perfil por avatar com iniciais, sem upload (4.1) e "Supabase Storage para as fotos de perfil" (anotação no Tech Brief 1) |
| **W6** | Tabelas `user_timeline_progress` e `pls` (PRD) e `user_quiz_progress`, `user_glossary_progress` e `cards` (Tech Brief) |
| **W7** | Partido do autor (`author_party`, PRD) e "categoria do autor" (`author_category`, Tech Brief) |
| **W8** | Etapas "A, B e C" (2.3, CA-03.1) sem definição de A e B depois que a jornada virou timeline de quizzes |
| **W9** | Hospedagem "Vercel ou Netlify" e a anotação "render" no Tech Brief 1 |

---

## Se você aprovar todas as recomendações

O MVP do piloto fica: o produto da Proposta (escola, professor, painel, gratuito) com as regras inegociáveis intactas, mais estas mecânicas do PRD: 70% para destravar (Y3), embaralhamento (Y4), glossário com aba e termo sublinhado (Y6), deslizar como atalho no Voto às Cegas (Y7), tela de entrada (Y8), os dois links na revelação (Y10), modal da TRC anônimo (Y11), texto de impacto social (Y12), PWA (Y13), validade e limite do código (Y15 a Y17), exclusão de conta, consentimento e prazo de guarda (Y18) e a verificação semanal das leis (Y19). Ficam para depois: XP e níveis, timer, mini-jogos de glossário e ranking.

Com a sua resposta, eu atualizo o banco, o plano do MVP e o `CLAUDE.md`, e cada item aprovado vira tarefa no plano.
