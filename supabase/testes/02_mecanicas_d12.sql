-- Testes das mecânicas aprovadas na D12 (migração 20261101120000_mecanicas_d12.sql).
-- Roda depois de 01_testes.sql e usa o mesmo cenário (escolas, turmas, alunos e ids guardados).

-- ---------------------------------------------------------------------
-- Y6: glossário
-- ---------------------------------------------------------------------
insert into public.glossario (termo, definicao, publicado) values ('Rascunho', 'Termo ainda em revisão.', false);
select teste.igual((select count(*)::int from public.glossario where publicado), 22, 'glossário: o seed traz os termos do app');
do $$ begin
  insert into public.glossario (termo, definicao, publicado) values ('Sem revisão', 'Definição.', true);
  perform teste.registrar('glossário: não publica termo sem revisão', false, 'publicou');
exception when check_violation then perform teste.registrar('glossário: não publica termo sem revisão', true);
end $$;
insert into public.glossario (termo, definicao, variantes, revisada_por, revisada_em, publicado)
values ('Termo de teste', 'Definição revisada.', '{"termos de teste"}', 'Equipe de conteúdo', now(), true);

select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.igual((select count(*)::int from public.glossario where termo = 'Termo de teste'), 1, 'glossário: aluno lê o termo publicado (Y6)');
select teste.igual((select count(*)::int from public.glossario where termo = 'Rascunho'), 0, 'glossário: termo não publicado não aparece');
select teste.negado($$ insert into public.glossario (termo, definicao) values ('x', 'y') $$, 'glossário: o app não cadastra termo');
reset role;

-- ---------------------------------------------------------------------
-- Y10 e Y12: link das votações do autor, contexto e data
-- ---------------------------------------------------------------------
select teste.guardar('lei_y12', (select id::text from public.leis where id_externo = 'exemplo-0420'));
update public.leis set link_autor = 'https://www.camara.leg.br/deputados/0000',
  contexto_problema = 'Quem trabalha de dia não chega ao posto antes de ele fechar.', contexto_argumentos = 'A favor: mais acesso. Contra: custo para as cidades.'
where id = teste.valor('lei_y12')::uuid;
do $$ begin
  update public.leis set link_autor = 'javascript:alert(1)' where id = teste.valor('lei_y12')::uuid;
  perform teste.registrar('leis: link do autor precisa ser endereço web', false, 'aceitou');
exception when check_violation then perform teste.registrar('leis: link do autor precisa ser endereço web', true);
end $$;

-- aluno1 já decidiu todas as leis de exemplo
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.ok((select link_autor like 'https://%' and length(contexto_problema) > 10 and contexto_argumentos like 'A favor%' from public.revelar_autoria(teste.valor('lei_y12')::uuid)),
  'voto: depois da decisão, vêm o contexto da lei e o link das votações do autor (Y10, Y12)');
reset role;

select set_config('request.jwt.claim.sub', :aluno2, false); set role authenticated;
select teste.negado($$ select contexto_problema from public.leis limit 1 $$, 'voto: o contexto não é lido direto da tabela');
select teste.negado($$ select link_autor from public.leis limit 1 $$, 'voto: o link do autor não é lido antes da decisão');
select teste.igual((select count(*)::int from public.revelar_autoria(teste.valor('lei_y12')::uuid)), 0, 'voto: quem não decidiu não vê o contexto nem o autor');
select teste.ok((select bool_and(apresentada_em is not null) from public.sessao_voto()), 'voto: a sessão traz a data de apresentação (Y12)');
reset role;

-- ---------------------------------------------------------------------
-- Y11: pergunta da TRC
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :aluno1, false); set role authenticated;
select teste.igual((select count(*)::int from public.opcoes_trc), 5, 'TRC: o app lê as opções da pergunta');
select teste.erro(format($$ select public.responder_trc(%L, array[]::smallint[]) $$, teste.valor('sessao')), 'opcao_invalida', 'TRC: precisa de pelo menos uma opção');
select teste.erro(format($$ select public.responder_trc(%L, array[99]::smallint[]) $$, teste.valor('sessao')), 'opcao_invalida', 'TRC: opção que não existe é recusada');
select teste.erro(format($$ select public.responder_trc(%L, array[1, 5]::smallint[]) $$, teste.valor('sessao')), 'opcao_invalida', 'TRC: "Nenhuma por agora" não combina com outra opção');
select public.responder_trc(teste.valor('sessao')::uuid, array[1, 3]::smallint[]);
select teste.erro(format($$ select public.responder_trc(%L, array[2]::smallint[]) $$, teste.valor('sessao')), 'sessao_invalida', 'TRC: cada sessão responde uma vez só');
select teste.negado($$ select * from public.contagem_trc $$, 'TRC: o app não lê a contagem');
reset role;

select set_config('request.jwt.claim.sub', :aluno2, false); set role authenticated;
select teste.erro(format($$ select public.responder_trc(%L, array[2]::smallint[]) $$, (select sessao_id from public.sessao_voto() limit 1)), 'sessao_invalida', 'TRC: só no fim da sessão');
select teste.erro(format($$ select public.responder_trc(%L, array[2]::smallint[]) $$, teste.valor('sessao')), 'sessao_invalida', 'TRC: ninguém responde pela sessão de outro');
reset role;

select teste.ok((select total = 1 from public.contagem_trc where chave = 'respostas')
  and (select total = 1 from public.contagem_trc where chave = 'com_intencao')
  and (select total = 1 from public.contagem_trc where chave = 'opcao:1')
  and (select total = 1 from public.contagem_trc where chave = 'opcao:3')
  and (select total = 0 from public.contagem_trc where chave = 'opcao:2'), 'TRC: só soma os totais por opção (Y11)');
select teste.igual((select count(*)::int from information_schema.columns where table_schema = 'public' and table_name = 'contagem_trc'), 2,
  'TRC: a contagem não tem como saber quem respondeu nem quando');

-- ---------------------------------------------------------------------
-- Y15 a Y17: código da turma
-- ---------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000d1', 'y1@teste'), ('00000000-0000-0000-0000-0000000000d2', 'y2@teste');
insert into public.aceites_termos (usuario_id, versao) values ('00000000-0000-0000-0000-0000000000d1', 1), ('00000000-0000-0000-0000-0000000000d2', 1);

select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select teste.guardar('turma_y15', (select turma_id::text from public.criar_turma('Turma Y15')));
select teste.igual((select valido_ate from public.turmas where id = teste.valor('turma_y15')::uuid),
  (date_trunc('year', now() at time zone 'America/Sao_Paulo') + interval '1 year - 1 day')::date, 'turma: o código vale até o fim do ano letivo (Y15)');
select teste.erro($$ select public.criar_turma('Antiga', null, current_date - 5) $$, 'validade_invalida', 'turma: validade no passado é recusada');
select public.ajustar_codigo_turma(teste.valor('turma_y15')::uuid, null, 1);
select teste.guardar('codigo_y15', (select codigo from public.turmas where id = teste.valor('turma_y15')::uuid));
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d1', false); set role authenticated;
select teste.igual((select turma_nome from public.entrar_na_turma(teste.valor('codigo_y15'))), 'Turma Y15', 'turma: entra dentro do limite');
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', false); set role authenticated;
select teste.erro(format($$ select public.entrar_na_turma(%L) $$, teste.valor('codigo_y15')), 'turma_lotada', 'turma: respeita o limite de alunos da turma (Y15)');
reset role;
update public.turmas set valido_ate = current_date - 5 where id = teste.valor('turma_y15')::uuid;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000d2', false); set role authenticated;
select teste.erro(format($$ select public.entrar_na_turma(%L) $$, teste.valor('codigo_y15')), 'codigo_expirado', 'turma: código vencido é recusado (Y15)');
select teste.igual((select turma_nome from public.entrar_na_turma(lower(substr(teste.valor('codigo_b'), 1, 4)) || '-' || lower(substr(teste.valor('codigo_b'), 5)))),
  'Turma B', 'turma: aceita o código com hífen e minúsculas (Y16)');
reset role;

-- ---------------------------------------------------------------------
-- Y18: apagar a conta e prazo de guarda
-- ---------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000e1', 'apagar@teste', '{"nome":"Nome Para Sumir"}');
insert into public.aceites_termos (usuario_id, versao) values ('00000000-0000-0000-0000-0000000000e1', 1);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false); set role authenticated;
select public.concluir_aula(teste.valor('aula1')::uuid);
select teste.guardar('tentativa_apagar', public.iniciar_tentativa(teste.valor('aula1')::uuid)::text);
select public.responder_questao(teste.valor('tentativa_apagar')::uuid, teste.valor('q1')::uuid, teste.valor('errada_q1')::uuid);
select public.apagar_minha_conta();
reset role;
select teste.ok(not exists (select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000e1')
  and not exists (select 1 from public.perfis where id = '00000000-0000-0000-0000-0000000000e1')
  and not exists (select 1 from public.aulas_concluidas where aluno_id = '00000000-0000-0000-0000-0000000000e1'),
  'conta: apagar remove a conta, o perfil e o progresso (Y18)');
select teste.ok((select aluno_id is null from public.tentativas_quiz where id = teste.valor('tentativa_apagar')::uuid)
  and exists (select 1 from public.respostas where tentativa_id = teste.valor('tentativa_apagar')::uuid),
  'conta: o histórico de quiz fica sem dono, só para as estatísticas das questões');
select teste.igual((select count(*)::int from public.auditoria where antes::text like '%Nome Para Sumir%' or depois::text like '%Nome Para Sumir%'), 0,
  'conta: a auditoria nunca guarda o nome da pessoa');

select set_config('request.jwt.claim.sub', :prof_a, false); set role authenticated;
select teste.erro($$ select public.apagar_minha_conta() $$, 'sem_permissao', 'conta: professor não apaga a própria conta pelo app');
reset role;

-- prazo de guarda: aluno sem turma e parado há mais de 12 meses é apagado pela rotina
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000e2', 'parado@teste'), ('00000000-0000-0000-0000-0000000000e3', 'recente@teste');
update public.perfis set criado_em = now() - interval '13 months' where id = '00000000-0000-0000-0000-0000000000e2';
select privado.rotina_diaria();
select teste.ok(not exists (select 1 from public.perfis where id = '00000000-0000-0000-0000-0000000000e2'), 'conta: a rotina apaga quem passou do prazo de guarda');
select teste.ok(exists (select 1 from public.perfis where id = '00000000-0000-0000-0000-0000000000e3')
  and exists (select 1 from public.perfis where id = :aluno1), 'conta: quem está ativo ou tem turma continua');

-- ---------------------------------------------------------------------
-- Y19: lei despublicada sai das sessões abertas
-- ---------------------------------------------------------------------
select set_config('request.jwt.claim.sub', :aluno2, false); set role authenticated;
select teste.guardar('sessao_y19', (select sessao_id::text from public.sessao_voto() limit 1));
select teste.guardar('lei_y19', (select lei_id::text from public.sessao_voto() where not decidida order by posicao limit 1));
reset role;
update public.leis set publicada = false, situacao = 'Arquivada', situacao_conferida_em = now() where id = teste.valor('lei_y19')::uuid;
select set_config('request.jwt.claim.sub', :aluno2, false); set role authenticated;
select teste.igual((select count(*)::int from public.sessao_voto() where lei_id = teste.valor('lei_y19')::uuid), 0, 'leis: despublicada sai da sessão aberta (Y19)');
select teste.igual((select max(total) from public.sessao_voto()), 14, 'leis: a contagem "de 15" desconta a lei que saiu');
select teste.erro(format($$ select public.registrar_decisao(%L, %L) $$, teste.valor('sessao_y19'), teste.valor('lei_y19')), 'lei_invalida', 'leis: não dá para decidir lei despublicada');
select count(*) from (select public.registrar_decisao(sessao_id, lei_id) from public.sessao_voto() where not decidida) x;
select teste.ok((select concluida_em is not null from public.sessoes_voto where id = teste.valor('sessao_y19')::uuid), 'leis: a sessão fecha sem a lei despublicada');
reset role;
update public.leis set publicada = true, situacao = null, situacao_conferida_em = null where id = teste.valor('lei_y19')::uuid;
