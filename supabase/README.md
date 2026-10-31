# Banco de dados do politiQ (Supabase)

Tudo o que o app guarda e todas as regras de negócio ficam aqui. O frontend não grava direto nas tabelas: chama as funções (RPC) abaixo. Leituras simples usam `select` direto, sempre filtrado pelas políticas de segurança por linha (RLS).

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `migrations/20261031120000_esquema_inicial.sql` | Esquema completo: 22 tabelas, funções, RLS, auditoria e rotina diária |
| `seed.sql` | Dados iniciais: termos v1, módulo 01 com 4 aulas e 17 questões, 15 leis de exemplo. Gerado por `npm run banco:seed` a partir de `src/data` |
| `testes/00_simula_supabase.sql` | Imita o Supabase (papéis, `auth.users`, `auth.uid()`) para testar num PostgreSQL comum |
| `testes/01_testes.sql` | 104 testes: regras do MVP, isolamento entre escolas, papéis, limites e painel |

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
- **Limites do usuário gratuito.** 5 vidas (cada erro gasta uma) e 5 decisões por dia; o dia é o de Brasília, então a recarga à meia-noite é automática.
- **Auditoria.** Mudanças da administração em escolas, contratos, perfis, termos, professores de turma, módulos, aulas, questões, alternativas e leis ficam em `auditoria`, com antes e depois.
- **Código da turma.** 8 caracteres sem letras que se confundem (0, O, 1, I, L), gerados com aleatoriedade forte; no máximo 10 códigos errados por hora por conta.

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
| Todos | `meus_limites()` | Vidas e decisões restantes hoje (nulos para quem não tem limite) |
| Todos | `atualizar_nome(nome)` | Muda o nome de exibição |
| Aluno | `entrar_na_turma(codigo)` | Entra com o código de 8 caracteres. Código errado devolve zero linhas. Erros: `ja_em_outra_turma`, `escola_sem_contrato`, `escola_lotada`, `muitas_tentativas` |
| Aluno | `minha_trilha()` | Aulas em ordem, com liberada, concluída, melhor resultado e número de tentativas |
| Aluno | `concluir_aula(aula)` | Marca como concluída (`aula_bloqueada` se a anterior não foi) |
| Aluno | `questoes_da_aula(aula)` | Perguntas e alternativas, sem o gabarito |
| Aluno | `iniciar_tentativa(aula)` | Começa (ou refaz) o quiz (`aula_nao_concluida`, `sem_vidas`) |
| Aluno | `responder_questao(tentativa, questao, alternativa)` | Devolve se acertou, a alternativa certa, a explicação e as vidas restantes |
| Aluno | `finalizar_tentativa(tentativa)` | Acertos e total; entra no histórico |
| Aluno | `sessao_voto()` | Abre ou retoma a sessão de até 15 leis, sem autoria; as decididas vêm primeiro |
| Aluno | `pular_lei(sessao, lei)` | Manda a lei para o fim da fila (não conta) |
| Aluno | `registrar_decisao(sessao, lei)` | Registra que houve decisão e devolve autor, partido e link (`sem_decisoes` no limite) |
| Aluno | `revelar_autoria(lei)` | Mostra de novo a autoria de uma lei já decidida |
| Professor | `criar_turma(nome, serie)`, `editar_turma`, `arquivar_turma`, `renovar_codigo` | Gestão das turmas e do código |
| Professor | `professores_da_escola()`, `adicionar_professor(turma, professor)` | Chamar outro professor da mesma escola |
| Professor, coordenação | `painel_indicadores(turma, de, ate)` | Matriculados, ativos, aulas concluídas, % de acerto e decisões (padrão: últimos 7 dias) |
| Professor, coordenação | `progresso_por_aula(turma)`, `desempenho_alunos(turma, de, ate)` | Progresso por aula e por aluno |
| Professor, coordenação | `questoes_com_mais_erro(turma, de, ate, limite)`, `sugestao_proxima_aula(turma)` | O que a turma mais errou e o que retomar |
| Professor, coordenação | `relatorio_turma(turma, de, ate)` | Linhas para o CSV (o app monta o arquivo) |
| Coordenação | `painel_escola(de, ate)` | Indicadores de todas as turmas da escola |
| Coordenação | `encerrar_matricula(aluno)` | Tira o aluno da turma; ele vira usuário gratuito |

## Decisões que valem conferir

- **Leis no banco.** A tabela `leis` está pronta para o cadastro com resumo da equipe. Hoje o app ainda busca as leis na Câmara; a troca depende da decisão sobre a fonte.
- **Aluno sem turma é gratuito.** Como o cadastro aberto ao público está fora do MVP, quem cria conta e ainda não entrou numa turma já tem os limites do usuário gratuito.
- **Trocar de turma** exige que a coordenação encerre a matrícula anterior.
- **Arquivar turma** só desativa o código; os alunos continuam matriculados até a coordenação encerrar.
