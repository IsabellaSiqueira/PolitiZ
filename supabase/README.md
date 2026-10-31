# Banco de dados do politiQ (Supabase)

Tudo o que o app guarda e todas as regras de negócio ficam aqui. O frontend não grava direto nas tabelas: chama as funções (RPC) abaixo. Leituras simples usam `select` direto, sempre filtrado pelas políticas de segurança por linha (RLS).

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `migrations/20261031120000_esquema_inicial.sql` | Esquema inicial: 22 tabelas, funções, RLS, auditoria e rotina diária |
| `migrations/20261101120000_mecanicas_d12.sql` | Mecânicas aprovadas na D12: 70% no quiz, embaralhar, glossário, TRC, contexto da lei, regras do código, apagar conta e prazo de guarda, status das leis |
| `seed.sql` | Dados iniciais: termos v1, módulo 01 com 4 aulas e 17 questões, 15 leis de exemplo. Gerado por `npm run banco:seed` a partir de `src/data` |
| `testes/00_simula_supabase.sql` | Imita o Supabase (papéis, `auth.users`, `auth.uid()`) para testar num PostgreSQL comum |
| `testes/01_testes.sql` | Regras do MVP, isolamento entre escolas, papéis, limites e painel |
| `testes/02_mecanicas_d12.sql` | Mecânicas da D12 |
| `testes/99_resultado.sql` | Resumo dos 153 testes (roda por último) |

## Como aplicar no Supabase

1. Crie o projeto e, em Database > Extensions, ative `pg_cron`.
2. Com a [Supabase CLI](https://supabase.com/docs/guides/cli): `supabase link --project-ref <projeto>` e depois `supabase db push`. Para ter os dados de exemplo num ambiente de teste: `supabase db reset` localmente, ou rode `seed.sql` no SQL Editor.
3. Em Authentication, deixe ligado só o login por e-mail e senha, com confirmação de e-mail. No cadastro, o app manda o nome em `options.data.nome`.
4. Se o `pg_cron` foi ativado depois da migração, agende a rotina: `select cron.schedule('politiq-rotina-diaria', '5 3 * * *', 'select privado.rotina_diaria()');` (00:05 em Brasília).

## Como testar

```bash
npm run banco:testar
```

Precisa de um PostgreSQL 15 ou mais novo. Por padrão usa `postgresql://postgres@localhost:5432/postgres`; troque com `BANCO_URL`. O script cria um banco temporário, aplica tudo, roda os testes e apaga o banco. Roda também no GitHub a cada envio.

## Regras garantidas no banco

- **O voto nunca é gravado.** Não existe coluna nem parâmetro de voto. `registrar_decisao` recebe só a sessão e a lei. Um teste falha se alguém criar uma coluna ou um parâmetro com "voto", "aprov" ou "rejeit".
- **Autoria escondida até a decisão.** O app não tem permissão de ler `autoria`, `partido` e `link` em `leis`; eles só voltam por `registrar_decisao` e `revelar_autoria` (esta só para lei já decidida).
- **Gabarito escondido.** O app não lê `alternativas.correta` nem `questoes.explicacao`; eles voltam por `responder_questao`, depois da resposta.
- **Isolamento entre escolas.** Professor vê só as próprias turmas; coordenação, só a própria escola; aluno, só os próprios dados. Professor e coordenação nunca leem `decisoes`: o painel devolve só contagens.
- **Sem escrita direta.** `anon` e `authenticated` não têm `insert`, `update` nem `delete` em tabela nenhuma.
- **Limites do usuário gratuito.** 5 vidas por dia, em que cada vida é uma **aula nova concluída** (errar no quiz e rever aula já concluída não gastam nada), e 5 decisões por dia. O dia é o de Brasília, então a recarga à meia-noite é automática. Aluno de turma não tem limite.
- **Revisão de conteúdo.** Questão só chega ao aluno com `revisada_por` e `revisada_em` preenchidos (no quiz, na leitura direta e no total de questões). Aula sem nenhuma questão revisada devolve `quiz_em_revisao`.
- **Logs.** Nenhum erro do banco leva argumento das funções na mensagem: só o código. Chame as funções sempre por POST (padrão do `supabase-js`), nunca com `{ get: true }`, para os argumentos não irem para a URL.
- **Auditoria.** Mudanças da administração em escolas, contratos, perfis, termos, professores de turma, módulos, aulas, questões, alternativas e leis ficam em `auditoria`, com antes e depois.
- **Código da turma.** 8 caracteres sem letras que se confundem (0, O, 1, I, L), gerados com aleatoriedade forte, aceitos com ou sem hífen e espaços. Vale até `valido_ate` (padrão: 31 de dezembro) e respeita o `limite_alunos` da turma, se houver. No máximo 5 códigos errados a cada 10 minutos por conta.
- **Quiz para destravar.** A próxima aula abre com a anterior lida **e** um quiz dela com 70% ou mais. Aula sem questão revisada ainda não tem quiz e só pede a leitura. Questões e alternativas vêm embaralhadas por tentativa (`questoes_da_tentativa`), na mesma ordem se a página recarregar.
- **Pergunta da TRC.** `contagem_trc` guarda só totais (respostas, com intenção, por opção). Não tem quem respondeu, quando nem em que sessão; `sessoes_voto.trc_respondida` só impede responder duas vezes.
- **Apagar a conta e prazo de guarda.** `apagar_minha_conta` remove conta, perfil e todo o progresso; as tentativas de quiz ficam sem dono, para as estatísticas das questões. A rotina diária apaga quem está sem turma e parado há mais de 12 meses (`privado.prazo_guarda`, a conferir com o jurídico). A auditoria nunca guarda nomes.
- **Status das leis.** A verificação semanal (`npm run leis -- verificar`) tira do ar a lei arquivada ou que já virou lei; ela some das sessões abertas, e as já decididas continuam contando.

## Papéis

| Papel | Como nasce |
| --- | --- |
| Aluno | Todo cadastro novo. Vira **escolar** ao entrar numa turma e **gratuito** quando a matrícula é encerrada (pela coordenação ou pela rotina diária, quando o contrato da escola acaba). |
| Professor, coordenação | A administração cria a conta no Auth e muda `perfis.papel` e `perfis.escola_id` no painel. |
| Administração | Usa o painel do Supabase (que ignora o RLS). O papel `admin` existe para marcar a equipe, sem tela própria. |

## Funções do app

Erros de regra voltam com um código curto na mensagem (ex.: `sem_vidas`) e uma explicação em português em `details`.

| Quem | Função | Para quê |
| --- | --- | --- |
| Todos | `aceitar_termos(versao)` | Aceite da versão vigente (exigido antes das outras funções) |
| Todos | `minha_conta()` | Nome, papel, turma, se é gratuito, se falta aceitar os termos |
| Todos | `meus_limites()` | Vidas (aulas novas) e decisões restantes hoje (nulos para quem não tem limite) |
| Todos | `atualizar_nome(nome)` | Muda o nome de exibição |
| Aluno | `entrar_na_turma(codigo)` | Entra com o código de 8 caracteres. Código errado devolve zero linhas. Erros: `codigo_expirado`, `turma_lotada`, `ja_em_outra_turma`, `escola_sem_contrato`, `escola_lotada`, `muitas_tentativas` |
| Aluno | `minha_trilha()` | Aulas em ordem, com liberada, concluída, melhor resultado e número de tentativas |
| Aluno | `concluir_aula(aula)` | Marca como concluída (`aula_bloqueada` se a anterior não foi; `sem_vidas` se o gratuito já concluiu 5 aulas novas hoje) |
| Aluno | `questoes_da_tentativa(tentativa)` | Perguntas e alternativas da tentativa, embaralhadas e sem o gabarito nem a letra original |
| Aluno | `iniciar_tentativa(aula)` | Começa (ou refaz) o quiz (`aula_nao_concluida`, `quiz_em_revisao`) |
| Aluno | `responder_questao(tentativa, questao, alternativa)` | Devolve se acertou, a alternativa certa e a explicação |
| Aluno | `finalizar_tentativa(tentativa)` | Acertos e total; entra no histórico |
| Aluno | `sessao_voto()` | Abre ou retoma a sessão de até 15 leis, sem autoria; as decididas vêm primeiro |
| Aluno | `pular_lei(sessao, lei)` | Manda a lei para o fim da fila (não conta) |
| Aluno | `registrar_decisao(sessao, lei)` | Registra que houve decisão e devolve autor, partido, contexto da lei (problema, o que muda, quem é afetado, argumentos dos dois lados, onde está), link oficial e link das votações do autor (`sem_decisoes` no limite) |
| Aluno | `revelar_autoria(lei)` | Mostra de novo a autoria, o contexto e os links de uma lei já decidida |
| Aluno | `responder_trc(sessao, opcoes)` | Pergunta da TRC no fim da sessão: soma 1 em cada opção escolhida (`opcao_invalida`, `sessao_invalida`) |
| Aluno | `apagar_minha_conta()` | Apaga a conta (professor e coordenação: só pela administração) |
| Professor | `criar_turma(nome, serie, valido_ate, limite_alunos)`, `editar_turma`, `arquivar_turma`, `renovar_codigo`, `ajustar_codigo_turma(turma, valido_ate, limite_alunos)` | Gestão das turmas e do código |
| Professor | `professores_da_escola()`, `adicionar_professor(turma, professor)` | Chamar outro professor da mesma escola |
| Professor, coordenação | `painel_indicadores(turma, de, ate)` | Matriculados, ativos, aulas concluídas, % de acerto e decisões (padrão: últimos 7 dias) |
| Professor, coordenação | `progresso_por_aula(turma)`, `desempenho_alunos(turma, de, ate)` | Progresso por aula e por aluno |
| Professor, coordenação | `questoes_com_mais_erro(turma, de, ate, limite)`, `sugestao_proxima_aula(turma)` | O que a turma mais errou e o que retomar |
| Professor, coordenação | `relatorio_turma(turma, de, ate)` | Linhas para o CSV (o app monta o arquivo) |
| Coordenação | `painel_escola(de, ate)` | Indicadores de todas as turmas da escola |
| Coordenação | `encerrar_matricula(aluno)` | Tira o aluno da turma; ele vira usuário gratuito |

## Decisões aprovadas pela Isa (31/10/2026)

- **Leis escolhidas pela equipe, cadastradas no banco.** Uma lei só pode ser publicada com o resumo da equipe e, se for real (Câmara ou Senado), com o link do texto oficial. Leis `exemplo` são fictícias e servem só para testes. A sessão traz as publicadas mais recentes (`apresentada_em`) que o aluno ainda não decidiu.
- **Aluno sem turma é gratuito.** Como o cadastro aberto ao público está fora do MVP, quem cria conta e ainda não entrou numa turma já tem os limites do usuário gratuito.
- **Trocar de turma** exige que a coordenação encerre a matrícula anterior.
- **Arquivar turma** só desativa o código; os alunos continuam matriculados até a coordenação encerrar.
- **Professor vê o nome dos alunos** no painel. O banco não guarda CPF, data de nascimento nem outro dado pessoal além do nome e do e-mail (este no Auth).
