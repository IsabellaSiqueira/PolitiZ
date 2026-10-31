-- Testes do banco do politiQ. Rodar com: npm run banco:testar
-- Cada bloco entra no banco como um usuário (papel "authenticated" + auth.uid()),
-- do mesmo jeito que o app faz pelo Supabase, e confere o que ele pode e não pode fazer.
\set ON_ERROR_STOP 1
\set QUIET 1
\pset tuples_only on
\pset format unaligned
-- esconde as saídas intermediárias; só o resultado aparece no fim
\o /dev/null

-- ---------------------------------------------------------------------
-- Ferramentas de teste
-- ---------------------------------------------------------------------
create schema teste;
create table teste.resultados (n serial, nome text, passou boolean, detalhe text);
create table teste.valores (chave text primary key, valor text);
grant usage on schema teste to anon, authenticated;

create function teste.registrar(p_nome text, p_passou boolean, p_detalhe text default null) returns void
language sql security definer as $$ insert into teste.resultados (nome, passou, detalhe) values (p_nome, p_passou, p_detalhe) $$;

create function teste.ok(p_cond boolean, p_nome text) returns void
language sql security definer as $$ select teste.registrar(p_nome, coalesce(p_cond, false), case when p_cond is null then 'resultado nulo' end) $$;

create function teste.igual(p_obtido anyelement, p_esperado anyelement, p_nome text) returns void
language sql security definer as $$
  select teste.registrar(p_nome, p_obtido is not distinct from p_esperado, format('obtido %s, esperado %s', p_obtido, p_esperado))
$$;

-- roda o SQL como o usuário atual e espera um erro de regra com este código
create function teste.erro(p_sql text, p_codigo text, p_nome text) returns void
language plpgsql as $$
begin
  execute p_sql;
  perform teste.registrar(p_nome, false, 'não deu erro');
exception when others then
  perform teste.registrar(p_nome, sqlerrm = p_codigo, format('erro: %s', sqlerrm));
end $$;

-- espera "permissão negada" (privilégio de coluna, tabela ou função)
create function teste.negado(p_sql text, p_nome text) returns void
language plpgsql as $$
begin
  execute p_sql;
  perform teste.registrar(p_nome, false, 'não foi negado');
exception when insufficient_privilege then
  perform teste.registrar(p_nome, true);
when others then
  perform teste.registrar(p_nome, false, format('outro erro: %s', sqlerrm));
end $$;

create function teste.guardar(p_chave text, p_valor text) returns void
language sql security definer as $$ insert into teste.valores values (p_chave, p_valor) on conflict (chave) do update set valor = excluded.valor $$;
create function teste.valor(p_chave text) returns text
language sql stable security definer as $$ select valor from teste.valores where chave = p_chave $$;

grant execute on all functions in schema teste to anon, authenticated;

-- ids fixos para ler os testes com facilidade
\set prof_a   '''00000000-0000-0000-0000-00000000000a'''
\set prof_a2  '''00000000-0000-0000-0000-0000000000a2'''
\set prof_b   '''00000000-0000-0000-0000-00000000000b'''
\set coord_a  '''00000000-0000-0000-0000-0000000000ca'''
\set aluno1   '''00000000-0000-0000-0000-000000000001'''
\set aluno2   '''00000000-0000-0000-0000-000000000002'''
\set aluno3   '''00000000-0000-0000-0000-000000000003'''
\set aluno_b  '''00000000-0000-0000-0000-0000000000b1'''
\set livre    '''00000000-0000-0000-0000-0000000000f1'''
\set sem_termo '''00000000-0000-0000-0000-0000000000f2'''

-- ---------------------------------------------------------------------
-- Cenário (como a administração faria pelo painel do Supabase)
-- ---------------------------------------------------------------------
insert into public.escolas (id, nome, cidade, uf) values
  ('10000000-0000-0000-0000-00000000000a', 'Escola A', 'Brasília', 'DF'),
  ('10000000-0000-0000-0000-00000000000b', 'Escola B', 'Goiânia', 'GO'),
  ('10000000-0000-0000-0000-00000000000c', 'Escola C', 'Recife', 'PE');
insert into public.contratos (escola_id, inicio, fim, limite_alunos) values
  ('10000000-0000-0000-0000-00000000000a', current_date - 30, current_date + 300, 4),
  ('10000000-0000-0000-0000-00000000000b', current_date - 30, current_date + 300, null),
  ('10000000-0000-0000-0000-00000000000c', current_date - 400, current_date - 2, null);

insert into auth.users (id, email, raw_user_meta_data) values
  (:prof_a, 'prof.a@teste', '{"nome":"Prof A"}'), (:prof_a2, 'prof.a2@teste', '{"nome":"Prof A2"}'),
  (:prof_b, 'prof.b@teste', '{"nome":"Prof B"}'), (:coord_a, 'coord.a@teste', '{"nome":"Coord A"}'),
  (:aluno1, 'aluno1@teste', '{"nome":"Ana"}'), (:aluno2, 'aluno2@teste', '{"nome":"Bia"}'),
  (:aluno3, 'aluno3@teste', '{"nome":"Caio"}'), (:aluno_b, 'aluno.b@teste', '{"nome":"Duda"}'),
  (:livre, 'livre@teste', '{}'), (:sem_termo, 'sem.termo@teste', '{"nome":"Edu"}');

select teste.igual((select papel::text from public.perfis where id = :aluno1), 'aluno', 'cadastro: conta nova vira perfil de aluno');
select teste.igual((select nome from public.perfis where id = :aluno1), 'Ana', 'cadastro: nome vem do formulário');
select teste.igual((select nome from public.perfis where id = :livre), 'Estudante', 'cadastro: sem nome, usa "Estudante"');

update public.perfis set papel = 'professor', escola_id = '10000000-0000-0000-0000-00000000000a' where id in (:prof_a, :prof_a2);
update public.perfis set papel = 'professor', escola_id = '10000000-0000-0000-0000-00000000000b' where id = :prof_b;
update public.perfis set papel = 'coordenacao', escola_id = '10000000-0000-0000-0000-00000000000a' where id = :coord_a;
insert into public.aceites_termos (usuario_id, versao) select id, 1 from public.perfis where id <> :sem_termo;

-- ---------------------------------------------------------------------
-- Esquema
-- ---------------------------------------------------------------------
select teste.igual((
  select count(*)::int from information_schema.columns
  where table_schema in ('public', 'privado') and column_name ~* '(voto|aprov|rejeit)'
), 0, 'regra 1: nenhuma coluna guarda voto');
select teste.igual((
  select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  cross join lateral unnest(p.proargnames, coalesce(p.proargmodes, array_fill('i'::"char", array[coalesce(cardinality(p.proargnames), 0)]))) as a(nome, modo)
  -- só parâmetros de entrada; colunas de saída como "decisoes_voto" são contagens
  where n.nspname in ('public', 'privado') and a.modo in ('i', 'b', 'v') and a.nome ~* '(voto|aprov|rejeit)'
), 0, 'regra 1: nenhuma função recebe voto');
select teste.igual((
  select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
), 0, 'RLS ligado em todas as tabelas');
select teste.igual((
  select count(*)::int from information_schema.role_table_grants
  where table_schema = 'public' and grantee in ('anon', 'authenticated') and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')
), 0, 'o app não escreve direto em nenhuma tabela');
select teste.igual((
  select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')
), 0, 'sem login não executa nenhuma função');
select teste.igual((
  select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'privado') and p.prosecdef
    and not coalesce('search_path=""' = any (p.proconfig), false)
), 0, 'funções security definer têm search_path fixo');

-- ---------------------------------------------------------------------
-- Termos de uso
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :sem_termo, false); set role authenticated;
select teste.erro($$ select public.entrar_na_turma('AAAAAAAA') $$, 'termos_pendentes', 'termos: sem aceite não entra na turma');
select teste.erro($$ select public.aceitar_termos(7) $$, 'versao_invalida', 'termos: só aceita a versão vigente');
select teste.ok((select termos_pendentes from public.minha_conta()), 'termos: minha_conta avisa que falta aceitar');
reset role;

-- ---------------------------------------------------------------------
-- Professor: turmas
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select teste.guardar('turma1', (select turma_id::text from public.criar_turma('1º ano A', '1º ano')));
select teste.guardar('codigo1', (select codigo from public.turmas where id = teste.valor('turma1')::uuid));
select teste.ok(teste.valor('codigo1') ~ '^[A-HJKMNP-Z2-9]{8}$', 'turma: código de 8 caracteres sem letras ambíguas');
select teste.guardar('turma2', (select turma_id::text from public.criar_turma('1º ano B')));
select teste.guardar('codigo2', (select codigo from public.turmas where id = teste.valor('turma2')::uuid));
select teste.ok(teste.valor('codigo1') <> teste.valor('codigo2'), 'turma: cada turma tem um código');
select teste.erro(format($$ select public.adicionar_professor(%L, %L) $$, teste.valor('turma1'), '00000000-0000-0000-0000-00000000000b'), 'professor_invalido', 'turma: não adiciona professor de outra escola');
select public.adicionar_professor(teste.valor('turma1')::uuid, '00000000-0000-0000-0000-0000000000a2');
select teste.igual((select count(*)::int from public.turma_professores where turma_id = teste.valor('turma1')::uuid), 2, 'turma: adiciona professor da mesma escola');
reset role;

select set_config('request.jwt.claim.sub', :prof_b, false); set role authenticated;
select teste.erro(format($$ select public.editar_turma(%L, 'invadida') $$, teste.valor('turma1')), 'sem_permissao', 'isolamento: professor de outra escola não edita a turma');
select teste.igual((select count(*)::int from public.turmas), 0, 'isolamento: professor de outra escola não vê as turmas');
select teste.igual((select count(*)::int from public.perfis where id <> auth.uid()), 0, 'isolamento: professor de outra escola não vê perfis');
select teste.guardar('turma_b', (select turma_id::text from public.criar_turma('Turma B')));
select teste.guardar('codigo_b', (select codigo from public.turmas where id = teste.valor('turma_b')::uuid));
reset role;

select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.erro($$ select public.criar_turma('minha') $$, 'sem_permissao', 'papel: aluno não cria turma');
reset role;

-- ---------------------------------------------------------------------
-- Aluno: entrar na turma
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.igual((select count(*)::int from public.entrar_na_turma('ZZZZZZZZ')), 0, 'turma: código errado não encontra turma');
select teste.igual((select turma_nome from public.entrar_na_turma(lower(substr(teste.valor('codigo1'), 1, 4)) || ' ' || lower(substr(teste.valor('codigo1'), 5)))), '1º ano A', 'turma: aceita código com minúsculas e espaço');
select teste.igual((select turma_nome from public.entrar_na_turma(teste.valor('codigo1'))), '1º ano A', 'turma: entrar de novo na mesma turma não dá erro');
select teste.igual((select count(*)::int from public.matriculas), 1, 'turma: não duplica a matrícula');
select teste.erro(format($$ select public.entrar_na_turma(%L) $$, teste.valor('codigo2')), 'ja_em_outra_turma', 'turma: um aluno fica em uma turma por vez');
select teste.igual((select gratuito from public.minha_conta()), false, 'turma: aluno matriculado é escolar');
select teste.igual((select vidas_restantes from public.meus_limites()), null::integer, 'limites: aluno escolar não tem limite');
reset role;

select set_config('request.jwt.claim.sub', :aluno2, false); set role authenticated;
select public.entrar_na_turma(teste.valor('codigo1'));
reset role;
select set_config('request.jwt.claim.sub', :aluno3, false); set role authenticated;
select public.entrar_na_turma(teste.valor('codigo2'));
reset role;
select set_config('request.jwt.claim.sub', :aluno_b, false); set role authenticated;
select public.entrar_na_turma(teste.valor('codigo_b'));
reset role;

-- força bruta no código
select set_config('request.jwt.claim.sub', :livre, false); set role authenticated;
select public.atualizar_nome('Fê');
select teste.igual((select nome from public.minha_conta()), 'Fê', 'conta: aluno muda o próprio nome');
select count(*) from generate_series(1, 10) i, public.entrar_na_turma('ERRADO' || i);
select teste.erro(format($$ select public.entrar_na_turma(%L) $$, teste.valor('codigo1')), 'muitas_tentativas', 'turma: 10 códigos errados bloqueiam por uma hora');
reset role;

-- escola sem contrato, turma arquivada, código renovado e limite de alunos
insert into public.turmas (id, escola_id, nome, codigo) values ('20000000-0000-0000-0000-00000000000c', '10000000-0000-0000-0000-00000000000c', 'Turma C', 'CCCCCCCC');
select set_config('request.jwt.claim.sub', :sem_termo, false);
insert into public.aceites_termos values (:sem_termo, 1);
set role authenticated;
select teste.erro($$ select public.entrar_na_turma('CCCCCCCC') $$, 'escola_sem_contrato', 'contrato: escola com contrato vencido não recebe alunos');
reset role;

select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select teste.guardar('codigo2_novo', (select public.renovar_codigo(teste.valor('turma2')::uuid)));
select teste.ok(teste.valor('codigo2_novo') <> teste.valor('codigo2'), 'turma: renovar troca o código');
reset role;
select set_config('request.jwt.claim.sub', :sem_termo, false); set role authenticated;
select teste.igual((select count(*)::int from public.entrar_na_turma(teste.valor('codigo2'))), 0, 'turma: código antigo para de funcionar');
-- escola A tem limite de 4 alunos: já tem 3, este é o 4º
select teste.igual((select turma_nome from public.entrar_na_turma(teste.valor('codigo2_novo'))), '1º ano B', 'turma: código novo funciona');
reset role;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000f3', 'extra@teste');
insert into public.aceites_termos values ('00000000-0000-0000-0000-0000000000f3', 1);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f3', false); set role authenticated;
select teste.erro(format($$ select public.entrar_na_turma(%L) $$, teste.valor('codigo2_novo')), 'escola_lotada', 'contrato: respeita o limite de alunos');
reset role;

select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select public.arquivar_turma(teste.valor('turma2')::uuid);
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f3', false); set role authenticated;
select teste.igual((select count(*)::int from public.entrar_na_turma(teste.valor('codigo2_novo'))), 0, 'turma: arquivada não aceita entrada');
reset role;

-- ---------------------------------------------------------------------
-- Aluno: aulas e quiz
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.guardar('aula1', (select id::text from public.aulas where slug = 'tres-poderes'));
select teste.guardar('aula2', (select id::text from public.aulas where slug = 'quem-faz-as-leis'));
select teste.negado($$ select correta from public.alternativas limit 1 $$, 'quiz: aluno não lê qual alternativa é a certa');
select teste.negado($$ select explicacao from public.questoes limit 1 $$, 'quiz: aluno não lê a explicação antes de responder');
select teste.ok(not exists (select 1 from public.questoes_da_aula(teste.valor('aula1')::uuid) q, jsonb_array_elements(q.alternativas) a where a ? 'correta'), 'quiz: perguntas chegam sem a resposta certa');
select teste.ok((select liberada from public.minha_trilha() where slug = 'tres-poderes') and not (select liberada from public.minha_trilha() where slug = 'quem-faz-as-leis'), 'aulas: só a primeira começa liberada');
select teste.erro(format($$ select public.concluir_aula(%L) $$, teste.valor('aula2')), 'aula_bloqueada', 'aulas: liberam em sequência');
select teste.erro(format($$ select public.iniciar_tentativa(%L) $$, teste.valor('aula1')), 'aula_nao_concluida', 'quiz: só depois de concluir a aula');
select public.concluir_aula(teste.valor('aula1')::uuid);
select teste.ok((select liberada from public.minha_trilha() where slug = 'quem-faz-as-leis'), 'aulas: concluir a 1 libera a 2');

select teste.guardar('tentativa1', public.iniciar_tentativa(teste.valor('aula1')::uuid)::text);
-- responde a 1ª errado e as outras certo
select teste.guardar('q1', (select id::text from public.questoes where aula_id = teste.valor('aula1')::uuid and ordem = 1));
select teste.guardar('q2', (select id::text from public.questoes where aula_id = teste.valor('aula1')::uuid and ordem = 2));
reset role;
-- o gabarito só é lido pelo dono do banco (no teste), nunca pelo aluno
select teste.guardar('certa_q1', (select id::text from public.alternativas where questao_id = teste.valor('q1')::uuid and correta));
select teste.guardar('errada_q1', (select id::text from public.alternativas where questao_id = teste.valor('q1')::uuid and not correta limit 1));
select teste.guardar('alt_q2', (select id::text from public.alternativas where questao_id = teste.valor('q2')::uuid limit 1));
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.erro(format($$ select public.responder_questao(%L, %L, %L) $$, teste.valor('tentativa1'), teste.valor('q1'), teste.valor('alt_q2')), 'alternativa_invalida', 'quiz: alternativa de outra pergunta é recusada');
select teste.ok((select not r.correta and r.alternativa_correta = teste.valor('certa_q1')::uuid and length(r.explicacao) > 10
  from public.responder_questao(teste.valor('tentativa1')::uuid, teste.valor('q1')::uuid, teste.valor('errada_q1')::uuid) r), 'quiz: resposta errada mostra a certa e a explicação');
select teste.erro(format($$ select public.responder_questao(%L, %L, %L) $$, teste.valor('tentativa1'), teste.valor('q1'), teste.valor('certa_q1')), 'ja_respondida', 'quiz: não responde a mesma pergunta duas vezes');
select teste.erro(format($$ select public.finalizar_tentativa(%L) $$, teste.valor('tentativa1')), 'quiz_incompleto', 'quiz: só termina com todas respondidas');
reset role;
-- responde o resto certo (o gabarito vem do dono do banco)
select teste.guardar('respostas_certas', (select string_agg(q.id || ':' || a.id, ',') from public.questoes q join public.alternativas a on a.questao_id = q.id and a.correta where q.aula_id = teste.valor('aula1')::uuid and q.ordem > 1));
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select count(*) from (select public.responder_questao(teste.valor('tentativa1')::uuid, split_part(x, ':', 1)::uuid, split_part(x, ':', 2)::uuid)
  from unnest(string_to_array(teste.valor('respostas_certas'), ',')) x) r;
select teste.ok((select acertos = total - 1 from public.finalizar_tentativa(teste.valor('tentativa1')::uuid)), 'quiz: resultado conta os acertos');
select teste.erro(format($$ select public.responder_questao(%L, %L, %L) $$, teste.valor('tentativa1'), teste.valor('q1'), teste.valor('certa_q1')), 'tentativa_finalizada', 'quiz: tentativa encerrada não aceita resposta');
select teste.guardar('tentativa1b', public.iniciar_tentativa(teste.valor('aula1')::uuid)::text);
select teste.igual((select tentativas from public.minha_trilha() where slug = 'tres-poderes'), 1, 'quiz: pode refazer, e o histórico guarda as tentativas');
reset role;

select set_config('request.jwt.claim.sub', :aluno2, false); set role authenticated;
select teste.erro(format($$ select public.responder_questao(%L, %L, %L) $$, teste.valor('tentativa1b'), teste.valor('q1'), teste.valor('certa_q1')), 'tentativa_invalida', 'quiz: ninguém responde pela tentativa de outro aluno');
select teste.igual((select count(*)::int from public.tentativas_quiz), 0, 'privacidade: aluno não vê o quiz de outro aluno');
select teste.igual((select count(*)::int from public.perfis), 1, 'privacidade: aluno só vê o próprio perfil');
select teste.igual((select count(*)::int from public.turmas), 1, 'privacidade: aluno vê só a própria turma');
reset role;

-- ---------------------------------------------------------------------
-- Aluno: Voto às Cegas
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.negado($$ select autoria from public.leis limit 1 $$, 'voto: aluno não lê a autoria antes de decidir');
select teste.negado($$ select partido from public.leis limit 1 $$, 'voto: aluno não lê o partido antes de decidir');
select teste.negado($$ select * from public.leis limit 1 $$, 'voto: select * em leis é negado (tem colunas escondidas)');
select teste.igual((select count(*)::int from public.sessao_voto()), 15, 'voto: sessão tem 15 leis');
select teste.guardar('sessao', (select sessao_id::text from public.sessao_voto() limit 1));
select teste.guardar('lei1', (select lei_id::text from public.sessao_voto() where posicao = 1));
select teste.guardar('lei2', (select lei_id::text from public.sessao_voto() where posicao = 2));
select teste.igual((select count(*)::int from public.revelar_autoria(teste.valor('lei1')::uuid)), 0, 'voto: autoria não aparece antes da decisão');

select public.pular_lei(teste.valor('sessao')::uuid, teste.valor('lei1')::uuid);
select teste.igual((select lei_id::text from public.sessao_voto() offset 14 limit 1), teste.valor('lei1'), 'voto: pular manda a lei para o fim da fila');
select teste.igual((select count(*)::int from public.sessao_voto() where decidida), 0, 'voto: pular não conta como decisão');

select teste.ok((select length(autoria) > 3 and exemplo from public.registrar_decisao(teste.valor('sessao')::uuid, teste.valor('lei2')::uuid)), 'voto: decidir revela autor e partido');
select teste.igual((select count(*)::int from public.revelar_autoria(teste.valor('lei2')::uuid)), 1, 'voto: autoria continua visível depois de recarregar');
select teste.erro(format($$ select public.registrar_decisao(%L, %L) $$, teste.valor('sessao'), teste.valor('lei2')), 'lei_invalida', 'voto: lei decidida não volta');
select teste.igual((select lei_id::text from public.sessao_voto() limit 1), teste.valor('lei2'), 'voto: decididas vêm primeiro (para mostrar "2 de 15")');
select teste.erro(format($$ select public.registrar_decisao(%L, %L, 'aprovo') $$, teste.valor('sessao'), teste.valor('lei1')), '42883', 'regra 1: não existe como mandar o voto ao banco');
reset role;

-- erro de função inexistente tem código, não mensagem: confere de outro jeito
update teste.resultados set passou = detalhe ~ 'does not exist|não existe' where nome = 'regra 1: não existe como mandar o voto ao banco';

-- termina a sessão: 14 leis restantes
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select count(*) from (select public.registrar_decisao(sessao_id, lei_id) from public.sessao_voto() where not decidida) x;
select teste.igual((select count(*)::int from public.sessoes_voto where concluida_em is not null), 1, 'voto: sessão fecha quando as 15 são decididas');
select teste.igual((select count(*)::int from public.sessao_voto()), 0, 'voto: sem leis novas, não abre sessão com leis já decididas');
reset role;

select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select teste.igual((select count(*)::int from public.decisoes), 0, 'regra 1: professor não lê as decisões do aluno');
select teste.igual((select decisoes_voto from public.painel_indicadores(teste.valor('turma1')::uuid)), 15, 'painel: professor vê só a contagem de decisões');
reset role;

-- ---------------------------------------------------------------------
-- Usuário gratuito: 5 vidas e 5 decisões por dia
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :sem_termo, false);
-- aluno da escola A sai da turma pela coordenação e vira gratuito
reset role;
select set_config('request.jwt.claim.sub', :coord_a, false); set role authenticated;
select teste.erro(format($$ select public.encerrar_matricula(%L) $$, '00000000-0000-0000-0000-0000000000b1'), 'matricula_nao_encontrada', 'coordenação: não mexe em aluno de outra escola');
select public.encerrar_matricula(:sem_termo);
reset role;

select set_config('request.jwt.claim.sub', :sem_termo, false); set role authenticated;
select teste.igual((select gratuito from public.minha_conta()), true, 'gratuito: aluno sem turma vira usuário gratuito');
select teste.igual((select vidas_restantes from public.meus_limites()), 5, 'gratuito: começa o dia com 5 vidas');
select teste.igual((select decisoes_restantes from public.meus_limites()), 5, 'gratuito: começa o dia com 5 decisões');
select teste.ok((select recarrega_em = ((now() at time zone 'America/Sao_Paulo')::date + 1)::timestamp at time zone 'America/Sao_Paulo' from public.meus_limites()), 'gratuito: recarga à meia-noite de Brasília');
select public.concluir_aula(teste.valor('aula1')::uuid);
-- 5 erros gastam as 5 vidas (cada erro numa tentativa nova, para ter perguntas livres)
do $$
declare t uuid;
begin
  for i in 1..5 loop
    t := public.iniciar_tentativa(teste.valor('aula1')::uuid);
    perform public.responder_questao(t, teste.valor('q1')::uuid, teste.valor('errada_q1')::uuid);
  end loop;
end $$;
select teste.igual((select vidas_restantes from public.meus_limites()), 0, 'gratuito: cada erro gasta uma vida');
select teste.erro(format($$ select public.iniciar_tentativa(%L) $$, teste.valor('aula1')), 'sem_vidas', 'gratuito: sem vidas, o quiz trava');
reset role;

-- acerto não gasta vida
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f3', false); set role authenticated;
select public.concluir_aula(teste.valor('aula1')::uuid);
select teste.igual((select vidas_restantes from public.responder_questao(public.iniciar_tentativa(teste.valor('aula1')::uuid), teste.valor('q1')::uuid, teste.valor('certa_q1')::uuid)), 5, 'gratuito: acerto não gasta vida');
-- decisões: pular não conta, a 6ª decisão é recusada
select teste.guardar('sessao_livre', (select sessao_id::text from public.sessao_voto() limit 1));
select public.pular_lei(sessao_id, lei_id) from public.sessao_voto() where posicao = 1;
select count(*) from (select public.registrar_decisao(sessao_id, lei_id) from public.sessao_voto() where not decidida and posicao between 2 and 6) x;
select teste.igual((select decisoes_restantes from public.meus_limites()), 0, 'gratuito: 5 decisões por dia (pular não conta)');
select teste.erro(format($$ select public.registrar_decisao(%L, (select lei_id from public.sessao_voto() where not decidida limit 1)) $$, teste.valor('sessao_livre')), 'sem_decisoes', 'gratuito: a 6ª decisão do dia é recusada');
reset role;
-- dia seguinte: o uso de ontem não conta
update public.uso_diario set dia = dia - 1 where usuario_id = '00000000-0000-0000-0000-0000000000f3';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000f3', false); set role authenticated;
select teste.igual((select decisoes_restantes from public.meus_limites()), 5, 'gratuito: os limites recarregam no dia seguinte');
reset role;

-- ---------------------------------------------------------------------
-- Painel do professor e da coordenação
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select teste.ok((select alunos_matriculados = 2 and alunos_ativos = 1 and aulas_concluidas = 1 and acerto_quizzes is not null
  from public.painel_indicadores(teste.valor('turma1')::uuid)), 'painel: quatro indicadores dos últimos 7 dias');
select teste.igual((select alunos_ativos from public.painel_indicadores(teste.valor('turma1')::uuid, current_date - 60, current_date - 30)), 0, 'painel: filtro de período');
select teste.igual((select alunos_concluiram from public.progresso_por_aula(teste.valor('turma1')::uuid) where numero = 1), 1, 'painel: progresso por aula');
select teste.igual((select count(*)::int from public.desempenho_alunos(teste.valor('turma1')::uuid)), 2, 'painel: desempenho de cada aluno');
select teste.igual((select questao_id::text from public.questoes_com_mais_erro(teste.valor('turma1')::uuid) limit 1), teste.valor('q1'), 'painel: questões com mais erro');
select teste.ok((select aula_sugerida_id is not null from public.sugestao_proxima_aula(teste.valor('turma1')::uuid)), 'painel: tema com menor acerto e sugestão de aula');
select teste.igual((select count(*)::int from public.relatorio_turma(teste.valor('turma1')::uuid)), 2, 'painel: linhas do relatório em CSV');
select teste.igual((select count(*)::int from public.perfis where papel = 'aluno'), 4, 'painel: professor vê os alunos das suas turmas (inclusive quem já saiu)');
reset role;

select set_config('request.jwt.claim.sub', :prof_b, false); set role authenticated;
select teste.erro(format($$ select * from public.painel_indicadores(%L) $$, teste.valor('turma1')), 'sem_permissao', 'isolamento: professor de outra escola não vê o painel');
reset role;
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.erro(format($$ select * from public.painel_indicadores(%L) $$, teste.valor('turma1')), 'sem_permissao', 'papel: aluno não vê o painel');
reset role;

select set_config('request.jwt.claim.sub', :coord_a, false); set role authenticated;
select teste.igual((select count(*)::int from public.painel_escola()), 2, 'coordenação: painel de todas as turmas da escola');
select teste.ok((select alunos_matriculados = 2 from public.painel_indicadores(teste.valor('turma1')::uuid)), 'coordenação: vê o painel de qualquer turma da escola');
select teste.erro(format($$ select * from public.painel_indicadores(%L) $$, teste.valor('turma_b')), 'sem_permissao', 'isolamento: coordenação não vê turma de outra escola');
reset role;

-- ---------------------------------------------------------------------
-- Rotina diária, administração e auditoria
-- ---------------------------------------------------------------------
-- a escola C tem uma matrícula ativa com o contrato já vencido
insert into public.matriculas (aluno_id, turma_id) values ('00000000-0000-0000-0000-0000000000f1', '20000000-0000-0000-0000-00000000000c');
select teste.igual(privado.rotina_diaria(), 1, 'rotina: contrato vencido encerra as matrículas');
select teste.ok((select motivo = 'contrato_encerrado' from public.matriculas where turma_id = '20000000-0000-0000-0000-00000000000c'), 'rotina: registra o motivo');
select teste.igual((select count(*)::int from public.matriculas m join public.turmas t on t.id = m.turma_id where t.escola_id = '10000000-0000-0000-0000-00000000000a' and m.encerrada_em is null), 3, 'rotina: escolas com contrato seguem iguais');

select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.negado($$ select privado.rotina_diaria() $$, 'rotina: o app não consegue rodar a rotina');
select teste.negado($$ update public.leis set autoria = 'x' $$, 'administração: o app não altera leis');
select teste.negado($$ insert into public.decisoes (aluno_id, lei_id) values (auth.uid(), gen_random_uuid()) $$, 'o app não grava decisão sem passar pela função');
select teste.negado($$ select * from public.contratos $$, 'privacidade: app não lê contratos');
reset role;

set role anon;
select teste.negado($$ select public.sessao_voto() $$, 'sem login: não chama funções do app');
select teste.negado($$ select * from public.perfis $$, 'sem login: não lê perfis');
reset role;

-- opção B: lei escolhida pela equipe só vai ao ar com resumo e link oficial
do $$ begin
  insert into public.leis (fonte, id_externo, rotulo, ementa, autoria, publicada) values ('camara', '999', 'PL 999/2026', 'Ementa.', 'Dep. X', true);
  perform teste.registrar('leis: não publica sem resumo da equipe', false, 'publicou');
exception when check_violation then perform teste.registrar('leis: não publica sem resumo da equipe', true);
end $$;
do $$ begin
  insert into public.leis (fonte, id_externo, rotulo, ementa, resumo, autoria, publicada) values ('camara', '999', 'PL 999/2026', 'Ementa.', 'Resumo.', 'Dep. X', true);
  perform teste.registrar('leis: lei real não publica sem link oficial', false, 'publicou');
exception when check_violation then perform teste.registrar('leis: lei real não publica sem link oficial', true);
end $$;
insert into public.leis (fonte, id_externo, rotulo, ementa, resumo, autoria, link, publicada)
values ('camara', '999', 'PL 999/2026', 'Ementa.', 'Resumo.', 'Dep. X', 'https://www.camara.leg.br/', true);
select teste.ok(true, 'leis: com resumo e link, publica');

update public.leis set resumo = 'Resumo revisado pela equipe.' where id_externo = 'exemplo-0418';
select teste.ok(exists (select 1 from public.auditoria where tabela = 'leis' and operacao = 'UPDATE'
  and antes ->> 'resumo' <> depois ->> 'resumo'), 'auditoria: registra o antes e o depois de cada mudança');
select set_config('request.jwt.claim.sub', :coord_a, false); set role authenticated;
select teste.negado($$ select * from public.auditoria $$, 'auditoria: o app não lê a auditoria');
reset role;

-- ---------------------------------------------------------------------
-- Resultado
-- ---------------------------------------------------------------------
\o
select format('%s %s%s', case when passou then '  ok  ' else 'FALHOU' end, nome, case when not passou then '  (' || coalesce(detalhe, '') || ')' else '' end)
from teste.resultados order by n;
select format(E'\n%s testes, %s falharam', count(*), count(*) filter (where not passou)) from teste.resultados;
do $$ begin if exists (select 1 from teste.resultados where not passou) then raise exception 'há testes falhando'; end if; end $$;
