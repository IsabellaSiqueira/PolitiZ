-- =====================================================================
-- politiQ · mecânicas aprovadas na decisão D12 (31/10/2026)
-- Ver docs/divergencias-prd.md, seção "Respostas da Isa".
--
--   Y3   a próxima aula abre com a anterior lida e o quiz dela com 70% ou mais
--   Y4   questões e alternativas embaralhadas a cada tentativa
--   Y6   glossário
--   Y10  link para as votações do autor, revelado só depois da decisão
--   Y11  pergunta da TRC no fim da sessão: só a contagem total por opção
--   Y12  contexto da lei (impacto social) e data de apresentação
--   Y15  código da turma com validade e limite de alunos
--   Y16  código aceito com ou sem hífen e espaços, maiúsculas ou minúsculas
--   Y17  no máximo 5 códigos errados a cada 10 minutos
--   Y18  apagar a conta, com o histórico de quiz anonimizado, e prazo de guarda
--        (a regra exata depende da base legal com o jurídico)
--   Y19  status das leis conferido toda semana; lei despublicada sai das sessões
--
-- Regras que continuam valendo: nenhum voto, razão ou opinião é gravado; a
-- pergunta da TRC vira só contagem, sem dizer quem respondeu o quê.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Y3: 70% no quiz para destravar a próxima aula
-- ---------------------------------------------------------------------

-- aula sem questão revisada ainda não tem quiz: basta a leitura
create function privado.quiz_aprovado(p_aluno uuid, p_aula uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select not exists (select 1 from public.questoes q where q.aula_id = p_aula and q.revisada_em is not null)
    or exists (
      select 1 from public.tentativas_quiz t
      where t.aluno_id = p_aluno and t.aula_id = p_aula and t.finalizada_em is not null
        and t.acertos * 10 >= t.total * 7
    )
$$;

create or replace function privado.aula_liberada(p_aluno uuid, p_aula uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  with ordem as (
    select a.id, lag(a.id) over (order by m.numero, a.numero) as anterior
    from public.aulas a join public.modulos m on m.id = a.modulo_id
    where a.publicado and m.publicado
  )
  select exists (
    select 1 from ordem o
    where o.id = p_aula
      and (o.anterior is null or (
        exists (select 1 from public.aulas_concluidas c where c.aluno_id = p_aluno and c.aula_id = o.anterior)
        and privado.quiz_aprovado(p_aluno, o.anterior)
      ))
  )
$$;

drop function public.minha_trilha();
create function public.minha_trilha()
returns table (
  modulo_numero integer, modulo_titulo text, aula_id uuid, slug text, numero integer, titulo text, resumo text,
  total_questoes integer, liberada boolean, concluida boolean, melhor_acertos integer, melhor_percentual numeric,
  quiz_aprovado boolean, tentativas integer
)
language sql stable security definer set search_path = ''
as $$
  select m.numero, m.titulo, a.id, a.slug, a.numero, a.titulo, a.resumo,
    (select count(*)::int from public.questoes q where q.aula_id = a.id and q.revisada_em is not null),
    privado.aula_liberada(auth.uid(), a.id),
    exists (select 1 from public.aulas_concluidas c where c.aluno_id = auth.uid() and c.aula_id = a.id),
    (select max(t.acertos) from public.tentativas_quiz t where t.aluno_id = auth.uid() and t.aula_id = a.id),
    (select max(round(100.0 * t.acertos / t.total, 1)) from public.tentativas_quiz t
      where t.aluno_id = auth.uid() and t.aula_id = a.id and t.finalizada_em is not null),
    privado.quiz_aprovado(auth.uid(), a.id),
    (select count(*)::int from public.tentativas_quiz t where t.aluno_id = auth.uid() and t.aula_id = a.id and t.finalizada_em is not null)
  from public.aulas a join public.modulos m on m.id = a.modulo_id
  where a.publicado and m.publicado and auth.uid() is not null
  order by m.numero, a.numero
$$;

-- ---------------------------------------------------------------------
-- Y4: perguntas da tentativa, embaralhadas
-- ---------------------------------------------------------------------

-- A ordem sai do hash da tentativa: muda a cada tentativa e fica igual se a página recarregar.
-- Não devolve a letra original: o app numera A, B, C, D pela posição.
drop function public.questoes_da_aula(uuid);
create function public.questoes_da_tentativa(p_tentativa uuid)
returns table (questao_id uuid, ordem integer, enunciado text, alternativas jsonb)
language sql stable security definer set search_path = ''
as $$
  select q.id, (row_number() over (order by md5(p_tentativa::text || q.id::text)))::int, q.enunciado,
    (select jsonb_agg(jsonb_build_object('id', al.id, 'texto', al.texto) order by md5(p_tentativa::text || al.id::text))
     from public.alternativas al where al.questao_id = q.id)
  from public.tentativas_quiz t
  join public.questoes q on q.aula_id = t.aula_id and q.revisada_em is not null
  where t.id = p_tentativa and t.aluno_id = auth.uid()
  order by md5(p_tentativa::text || q.id::text)
$$;

-- ---------------------------------------------------------------------
-- Y6: glossário
-- ---------------------------------------------------------------------

create table public.glossario (
  id uuid primary key default gen_random_uuid(),
  termo text not null check (length(trim(termo)) between 1 and 80),
  definicao text not null check (length(trim(definicao)) between 1 and 600),
  -- outras formas que aparecem no texto (plural, sigla), para sublinhar o termo
  variantes text[] not null default '{}',
  modulo_id uuid references public.modulos (id) on delete set null,
  revisada_por text,
  revisada_em timestamptz,
  publicado boolean not null default false,
  check ((revisada_por is null) = (revisada_em is null)),
  -- como as questões (D4): só chega ao aluno depois da revisão de conteúdo
  check (not publicado or revisada_em is not null)
);
create unique index glossario_termo_idx on public.glossario (lower(termo));
comment on table public.glossario is 'Termos explicados em linguagem simples. Abre na aba do glossário e ao tocar no termo sublinhado.';

create trigger auditar after insert or update or delete on public.glossario
  for each row execute function privado.auditar();

-- ---------------------------------------------------------------------
-- Y10 e Y12: link das votações do autor, contexto da lei e status
-- ---------------------------------------------------------------------

alter table public.leis
  -- página do autor no portal oficial ("Ver votações de ..."), revelada só depois da decisão
  add column link_autor text check (link_autor ~ '^https?://'),
  -- contexto da lei escrito pela equipe (tela D9 do protótipo), mostrado depois da decisão
  add column impacto_social text check (length(trim(impacto_social)) > 0),
  -- Y19: situação na fonte oficial, conferida toda semana
  add column situacao text,
  add column situacao_conferida_em timestamptz;
alter table public.leis add constraint leis_link_https check (link ~ '^https?://');

drop function public.sessao_voto();
create function public.sessao_voto()
returns table (
  sessao_id uuid, lei_id uuid, posicao smallint, rotulo text, tema text, ementa text, resumo text,
  apresentada_em date, decidida boolean, total integer
)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_sessao uuid;
begin
  select id into v_sessao from public.sessoes_voto where aluno_id = v_aluno and concluida_em is null;
  if v_sessao is null then
    if not exists (
      select 1 from public.leis l where l.publicada
      and not exists (select 1 from public.decisoes d where d.aluno_id = v_aluno and d.lei_id = l.id)
    ) then
      return;
    end if;
    insert into public.sessoes_voto (aluno_id) values (v_aluno) returning id into v_sessao;
    insert into public.itens_sessao (sessao_id, lei_id, posicao, fila)
    select v_sessao, l.id, row_number() over w, row_number() over w
    from public.leis l
    where l.publicada and not exists (select 1 from public.decisoes d where d.aluno_id = v_aluno and d.lei_id = l.id)
    window w as (order by l.apresentada_em desc nulls last, l.id)
    order by l.apresentada_em desc nulls last, l.id
    limit 15;
  end if;
  return query
    select v_sessao, l.id, i.posicao, l.rotulo, l.tema, l.ementa, l.resumo, l.apresentada_em, i.decidida_em is not null,
      (select count(*)::int from public.itens_sessao x join public.leis lx on lx.id = x.lei_id
       where x.sessao_id = v_sessao and (x.decidida_em is not null or lx.publicada))
    from public.itens_sessao i join public.leis l on l.id = i.lei_id
    where i.sessao_id = v_sessao
      -- Y19: lei despublicada no meio da sessão sai da fila (as já decididas continuam contando)
      and (i.decidida_em is not null or l.publicada)
    order by i.decidida_em is null, i.decidida_em, i.fila;
end
$$;

drop function public.registrar_decisao(uuid, uuid);
-- REGRA 1: recebe só a lei. O voto fica na tela do aluno e nunca chega aqui.
create function public.registrar_decisao(p_sessao uuid, p_lei uuid)
returns table (
  autoria text, partido text, coautores integer, link text, link_autor text, impacto_social text,
  exemplo boolean, sessao_concluida boolean, decisoes_restantes integer
)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_gratuito boolean := privado.eh_gratuito(v_aluno);
  v_usadas integer;
  v_concluida boolean;
begin
  if not exists (
    select 1 from public.itens_sessao i
    join public.sessoes_voto s on s.id = i.sessao_id
    join public.leis l on l.id = i.lei_id
    where i.sessao_id = p_sessao and i.lei_id = p_lei and i.decidida_em is null
      and s.aluno_id = v_aluno and s.concluida_em is null and l.publicada
  ) then
    perform privado.erro('lei_invalida', 'Essa lei não está pendente na sua sessão.');
  end if;

  if v_gratuito then
    insert into public.uso_diario (usuario_id, dia) values (v_aluno, privado.dia_brasilia()) on conflict do nothing;
    update public.uso_diario set decisoes = decisoes + 1
    where usuario_id = v_aluno and dia = privado.dia_brasilia() and decisoes < 5
    returning decisoes into v_usadas;
    if v_usadas is null then
      perform privado.erro('sem_decisoes', 'Suas decisões de hoje acabaram. Elas voltam à meia-noite.');
    end if;
  end if;

  insert into public.decisoes (aluno_id, lei_id, sessao_id) values (v_aluno, p_lei, p_sessao);
  update public.itens_sessao set decidida_em = now() where sessao_id = p_sessao and lei_id = p_lei;

  -- a sessão fecha quando não sobra lei publicada pendente
  v_concluida := not exists (
    select 1 from public.itens_sessao i join public.leis l on l.id = i.lei_id
    where i.sessao_id = p_sessao and i.decidida_em is null and l.publicada
  );
  if v_concluida then
    update public.sessoes_voto set concluida_em = now() where id = p_sessao;
  end if;

  return query select l.autoria, l.partido, l.coautores, l.link, l.link_autor, l.impacto_social,
    l.fonte = 'exemplo', v_concluida, case when v_gratuito then 5 - v_usadas end
  from public.leis l where l.id = p_lei;
end
$$;

drop function public.revelar_autoria(uuid);
create function public.revelar_autoria(p_lei uuid)
returns table (autoria text, partido text, coautores integer, link text, link_autor text, impacto_social text, exemplo boolean)
language sql stable security definer set search_path = ''
as $$
  select l.autoria, l.partido, l.coautores, l.link, l.link_autor, l.impacto_social, l.fonte = 'exemplo'
  from public.leis l
  where l.id = p_lei and exists (select 1 from public.decisoes d where d.aluno_id = auth.uid() and d.lei_id = p_lei)
$$;

-- ---------------------------------------------------------------------
-- Y11: pergunta da TRC (Taxa de Retenção Cívica) no fim da sessão
-- ---------------------------------------------------------------------

create table public.opcoes_trc (
  id smallint primary key,
  texto text not null,
  -- "Nenhuma por agora" não conta como intenção de agir
  intencao boolean not null default true,
  ordem smallint not null,
  ativa boolean not null default true
);

-- Só totais. Não há quem respondeu, quando, nem em que sessão.
create table public.contagem_trc (
  chave text primary key,
  total bigint not null default 0 check (total >= 0)
);
comment on table public.contagem_trc is 'Contagem anônima da pergunta da TRC. Chaves: respostas, com_intencao e opcao:<id>.';

insert into public.opcoes_trc (id, texto, intencao, ordem) values
  (1, 'Pesquisar mais sobre um projeto ou quem o propôs', true, 1),
  (2, 'Conversar sobre política com alguém', true, 2),
  (3, 'Acompanhar uma votação no Congresso', true, 3),
  (4, 'Organizar algo na minha comunidade', true, 4),
  (5, 'Nenhuma por agora', false, 5);
insert into public.contagem_trc (chave) values ('respostas'), ('com_intencao');
insert into public.contagem_trc (chave) select 'opcao:' || id from public.opcoes_trc;

-- marca só que a pergunta daquela sessão já foi respondida, para não contar duas vezes
alter table public.sessoes_voto add column trc_respondida boolean not null default false;

create function public.responder_trc(p_sessao uuid, p_opcoes smallint[]) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_opcoes smallint[];
begin
  select array_agg(distinct o) into v_opcoes from unnest(p_opcoes) o;
  if coalesce(cardinality(v_opcoes), 0) = 0
     or exists (select 1 from unnest(v_opcoes) o where not exists (select 1 from public.opcoes_trc t where t.id = o and t.ativa)) then
    perform privado.erro('opcao_invalida', 'Escolha pelo menos uma das opções.');
  end if;
  if (select count(*) from unnest(v_opcoes) o join public.opcoes_trc t on t.id = o where not t.intencao) > 0
     and cardinality(v_opcoes) > 1 then
    perform privado.erro('opcao_invalida', '"Nenhuma por agora" não combina com as outras opções.');
  end if;

  update public.sessoes_voto set trc_respondida = true
  where id = p_sessao and aluno_id = v_aluno and concluida_em is not null and not trc_respondida;
  if not found then
    perform privado.erro('sessao_invalida', 'A pergunta aparece uma vez, no fim de cada sessão.');
  end if;

  update public.contagem_trc set total = total + 1 where chave = 'respostas';
  update public.contagem_trc set total = total + 1
  where chave = 'com_intencao' and exists (select 1 from public.opcoes_trc t where t.id = any (v_opcoes) and t.intencao);
  update public.contagem_trc set total = total + 1 where chave = any (select 'opcao:' || o from unnest(v_opcoes) o);
end
$$;

-- ---------------------------------------------------------------------
-- Y15 a Y17: código da turma
-- ---------------------------------------------------------------------

alter table public.turmas
  -- validade do código: padrão é o fim do ano letivo (31 de dezembro)
  add column valido_ate date not null
    default ((date_trunc('year', now() at time zone 'America/Sao_Paulo') + interval '1 year - 1 day')::date),
  add column limite_alunos integer check (limite_alunos > 0);

drop function public.criar_turma(text, text);
create function public.criar_turma(p_nome text, p_serie text default null, p_valido_ate date default null, p_limite_alunos integer default null)
returns table (turma_id uuid, codigo char(8), valido_ate date)
language plpgsql security definer set search_path = ''
as $$
declare
  v_prof uuid := privado.exigir(array['professor']::public.papel_usuario[]);
  v_escola uuid := privado.minha_escola();
  v_id uuid;
  v_codigo char(8) := privado.gerar_codigo();
  v_validade date := coalesce(p_valido_ate, (date_trunc('year', privado.dia_brasilia()) + interval '1 year - 1 day')::date);
begin
  if not privado.escola_tem_contrato(v_escola) then
    perform privado.erro('escola_sem_contrato', 'A escola não está com o acesso ativo.');
  end if;
  if v_validade < privado.dia_brasilia() then
    perform privado.erro('validade_invalida', 'A validade do código precisa ser uma data futura.');
  end if;
  if p_limite_alunos is not null and p_limite_alunos < 1 then
    perform privado.erro('limite_invalido', 'O limite de alunos precisa ser 1 ou mais.');
  end if;
  insert into public.turmas (escola_id, nome, serie, codigo, codigo_renovado_em, criada_por, valido_ate, limite_alunos)
  values (v_escola, trim(p_nome), nullif(trim(p_serie), ''), v_codigo, now(), v_prof, v_validade, p_limite_alunos)
  returning id into v_id;
  insert into public.turma_professores (turma_id, professor_id, adicionado_por) values (v_id, v_prof, v_prof);
  return query select v_id, v_codigo, v_validade;
end
$$;

-- validade e limite novos; nulo mantém o que está
create function public.ajustar_codigo_turma(p_turma uuid, p_valido_ate date default null, p_limite_alunos integer default null) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform privado.exigir(array['professor']::public.papel_usuario[]);
  if not privado.leciona(p_turma) then perform privado.erro('sem_permissao', 'Você não é professor desta turma.'); end if;
  if p_valido_ate is not null and p_valido_ate < privado.dia_brasilia() then
    perform privado.erro('validade_invalida', 'A validade do código precisa ser uma data futura.');
  end if;
  if p_limite_alunos is not null and p_limite_alunos < 1 then
    perform privado.erro('limite_invalido', 'O limite de alunos precisa ser 1 ou mais.');
  end if;
  update public.turmas
  set valido_ate = coalesce(p_valido_ate, valido_ate), limite_alunos = coalesce(p_limite_alunos, limite_alunos)
  where id = p_turma;
end
$$;

create or replace function public.entrar_na_turma(p_codigo text)
returns table (turma_id uuid, turma_nome text, escola_nome text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  -- Y16: aceita com ou sem hífen e espaços, maiúsculas ou minúsculas. Os códigos não usam
  -- 0, O, 1, I nem L, então não há letra que se confunda com número.
  v_codigo text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  v_turma public.turmas;
  v_atual uuid;
  v_limite integer;
  v_ativos integer;
begin
  -- Y17: no máximo 5 códigos errados a cada 10 minutos
  if (select count(*) from public.tentativas_codigo
      where usuario_id = v_aluno and not sucesso and em > now() - interval '10 minutes') >= 5 then
    perform privado.erro('muitas_tentativas', 'Muitos códigos errados. Tente de novo daqui a 10 minutos.');
  end if;

  select * into v_turma from public.turmas where codigo = v_codigo and arquivada_em is null;
  if v_turma.id is null then
    -- código errado não levanta erro: um erro desfaria o registro da tentativa
    -- e o limite acima nunca chegaria. O app trata "nenhuma linha" como código inválido.
    insert into public.tentativas_codigo (usuario_id, sucesso) values (v_aluno, false);
    return;
  end if;
  if v_turma.valido_ate < privado.dia_brasilia() then
    perform privado.erro('codigo_expirado', 'O código desta turma venceu. Peça um código novo ao professor.');
  end if;
  if not privado.escola_tem_contrato(v_turma.escola_id) then
    perform privado.erro('escola_sem_contrato', 'A escola desta turma não está com o acesso ativo.');
  end if;

  v_atual := privado.turma_ativa(v_aluno);
  if v_atual = v_turma.id then
    return query select v_turma.id, v_turma.nome, (select nome from public.escolas where id = v_turma.escola_id);
    return;
  elsif v_atual is not null then
    perform privado.erro('ja_em_outra_turma', 'Você já está em outra turma. Peça à coordenação para encerrar a matrícula anterior.');
  end if;

  if v_turma.limite_alunos is not null and (
    select count(*) from public.matriculas m where m.turma_id = v_turma.id and m.encerrada_em is null
  ) >= v_turma.limite_alunos then
    perform privado.erro('turma_lotada', 'A turma já tem o número de alunos combinado. Fale com o professor.');
  end if;

  select c.limite_alunos into v_limite from public.contratos c
  where c.escola_id = v_turma.escola_id and privado.dia_brasilia() between c.inicio and c.fim
  order by c.fim desc limit 1;
  if v_limite is not null then
    select count(*) into v_ativos from public.matriculas m join public.turmas t on t.id = m.turma_id
    where t.escola_id = v_turma.escola_id and m.encerrada_em is null;
    if v_ativos >= v_limite then
      perform privado.erro('escola_lotada', 'A escola atingiu o número de alunos do contrato.');
    end if;
  end if;

  insert into public.matriculas (aluno_id, turma_id) values (v_aluno, v_turma.id);
  insert into public.tentativas_codigo (usuario_id, sucesso) values (v_aluno, true);
  return query select v_turma.id, v_turma.nome, (select nome from public.escolas where id = v_turma.escola_id);
end
$$;

-- ---------------------------------------------------------------------
-- Y18: apagar a conta e prazo de guarda
-- ---------------------------------------------------------------------

-- O histórico de quiz fica, sem dono, para as estatísticas das questões.
-- Todo o resto do aluno (perfil, matrículas, aulas, decisões, sessões, aceites) é apagado.
alter table public.tentativas_quiz alter column aluno_id drop not null;
alter table public.tentativas_quiz drop constraint tentativas_quiz_aluno_id_fkey;
alter table public.tentativas_quiz add constraint tentativas_quiz_aluno_id_fkey
  foreign key (aluno_id) references public.perfis (id) on delete set null;

-- A auditoria nunca guarda o nome da pessoa: só papel e escola interessam a ela,
-- e o nome precisa sumir de vez quando a conta é apagada.
create or replace function privado.auditar() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.auditoria (tabela, operacao, antes, depois, alterado_por)
  values (
    tg_table_name,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) - 'nome' end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) - 'nome' end,
    auth.uid()
  );
  return coalesce(new, old);
end
$$;
update public.auditoria set antes = antes - 'nome', depois = depois - 'nome' where tabela = 'perfis';

-- A CONFERIR com o jurídico (base legal pendente): período do curso mais 12 meses
create function privado.prazo_guarda() returns interval
language sql immutable set search_path = ''
as $$ select interval '12 months' $$;

create function privado.apagar_conta(p_usuario uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  -- apagar no Auth apaga o perfil e, em cascata, tudo que é dele
  delete from auth.users where id = p_usuario;
end
$$;

create function public.apagar_minha_conta() returns void
language plpgsql security definer set search_path = ''
as $$
declare v_usuario uuid := auth.uid();
begin
  if v_usuario is null then perform privado.erro('sem_login', 'Entre na sua conta para continuar.'); end if;
  -- professor e coordenação têm turmas e escola ligadas a eles: quem apaga é a administração
  if privado.meu_papel() <> 'aluno' then
    perform privado.erro('sem_permissao', 'Para apagar uma conta de professor ou coordenação, fale com o politiQ.');
  end if;
  perform privado.apagar_conta(v_usuario);
end
$$;

-- última atividade do aluno, para o prazo de guarda
create function privado.ultima_atividade(p_aluno uuid) returns timestamptz
language sql stable security definer set search_path = ''
as $$
  select greatest(
    (select criado_em from public.perfis where id = p_aluno),
    (select max(concluida_em) from public.aulas_concluidas where aluno_id = p_aluno),
    (select max(iniciada_em) from public.tentativas_quiz where aluno_id = p_aluno),
    (select max(decidida_em) from public.decisoes where aluno_id = p_aluno),
    (select max(coalesce(encerrada_em, now())) from public.matriculas where aluno_id = p_aluno)
  )
$$;

create or replace function privado.rotina_diaria() returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_total integer;
begin
  update public.matriculas m set encerrada_em = now(), motivo = 'contrato_encerrado'
  from public.turmas t
  where m.encerrada_em is null and t.id = m.turma_id and not privado.escola_tem_contrato(t.escola_id);
  get diagnostics v_total = row_count;

  -- prazo de guarda: aluno sem turma e sem atividade há mais que o prazo tem a conta apagada
  perform privado.apagar_conta(p.id)
  from public.perfis p
  where p.papel = 'aluno' and privado.turma_ativa(p.id) is null
    and privado.ultima_atividade(p.id) < now() - privado.prazo_guarda();

  -- tentativas de código antigas não servem mais
  delete from public.tentativas_codigo where em < now() - interval '30 days';
  return v_total;
end
$$;

-- ---------------------------------------------------------------------
-- Permissões e RLS dos objetos novos
-- ---------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema privado from public, anon, authenticated;

-- as mesmas leituras diretas de antes (o revoke acima tirou todas)
grant select on public.escolas, public.perfis, public.turmas, public.turma_professores, public.matriculas,
  public.modulos, public.aulas, public.aulas_concluidas, public.tentativas_quiz, public.respostas,
  public.sessoes_voto, public.itens_sessao, public.decisoes, public.uso_diario, public.aceites_termos,
  public.glossario, public.opcoes_trc
to authenticated;
grant select on public.termos_uso to anon, authenticated;
grant select (id, aula_id, ordem, enunciado) on public.questoes to authenticated;
grant select (id, questao_id, letra, texto) on public.alternativas to authenticated;
grant select (id, fonte, id_externo, rotulo, tema, ementa, resumo, apresentada_em, publicada) on public.leis to authenticated;

grant execute on function privado.meu_papel(), privado.minha_escola(), privado.leciona(uuid),
  privado.pode_ver_turma(uuid), privado.pode_ver_aluno(uuid), privado.turma_ativa(uuid) to authenticated;

grant execute on function
  public.aceitar_termos(integer), public.atualizar_nome(text), public.minha_conta(), public.meus_limites(),
  public.apagar_minha_conta(),
  public.entrar_na_turma(text), public.minha_trilha(), public.concluir_aula(uuid), public.questoes_da_tentativa(uuid),
  public.iniciar_tentativa(uuid), public.responder_questao(uuid, uuid, uuid), public.finalizar_tentativa(uuid),
  public.sessao_voto(), public.pular_lei(uuid, uuid), public.registrar_decisao(uuid, uuid), public.revelar_autoria(uuid),
  public.responder_trc(uuid, smallint[]),
  public.criar_turma(text, text, date, integer), public.editar_turma(uuid, text, text), public.arquivar_turma(uuid),
  public.renovar_codigo(uuid), public.ajustar_codigo_turma(uuid, date, integer),
  public.professores_da_escola(), public.adicionar_professor(uuid, uuid),
  public.painel_indicadores(uuid, date, date), public.progresso_por_aula(uuid), public.desempenho_alunos(uuid, date, date),
  public.questoes_com_mais_erro(uuid, date, date, integer), public.sugestao_proxima_aula(uuid),
  public.relatorio_turma(uuid, date, date), public.painel_escola(date, date), public.encerrar_matricula(uuid)
to authenticated;

alter table public.glossario enable row level security;
alter table public.opcoes_trc enable row level security;
alter table public.contagem_trc enable row level security;

create policy "glossario: publicado" on public.glossario for select to authenticated using (publicado);
create policy "opcoes_trc: ativas" on public.opcoes_trc for select to authenticated using (ativa);
-- contagem_trc: sem política, só a administração lê
