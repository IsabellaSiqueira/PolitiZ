-- =====================================================================
-- politiQ · esquema inicial do banco (Supabase, PostgreSQL 15 ou mais novo)
--
-- Regras que este arquivo garante no banco, e não só na interface:
--   1. O voto nunca é gravado. Não existe coluna, parâmetro ou log com
--      "aprovou" ou "rejeitou". Registra-se só QUE houve decisão (decisoes).
--   2. Isolamento entre escolas e controle por papel com RLS.
--   3. LGPD: só o necessário (nome de exibição; o e-mail fica no Supabase Auth).
--
-- Como o app usa o banco:
--   * Leitura: select direto nas tabelas, filtrado pelas políticas RLS.
--   * Escrita: só pelas funções (RPC) deste arquivo. Nenhum papel do app
--     tem insert, update ou delete em tabela nenhuma.
--   * Colunas sensíveis (resposta certa, explicação, autoria da lei) não
--     podem ser lidas direto: só voltam pelas funções, no momento certo.
--   * A administração (equipe politiQ) cadastra escolas, contratos,
--     professores, aulas, questões e leis pelo painel do Supabase. Toda
--     mudança nessas tabelas vai para a auditoria.
--
-- Funções internas ficam no schema "privado", que a API do Supabase não expõe.
-- Erros de regra de negócio usam códigos curtos na mensagem (ex.: 'sem_vidas'),
-- para o app traduzir; o detalhe em português fica em DETAIL.
-- =====================================================================

create schema if not exists privado;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------

create type public.papel_usuario as enum ('aluno', 'professor', 'coordenacao', 'admin');
create type public.motivo_encerramento as enum ('coordenacao', 'contrato_encerrado');

-- ---------------------------------------------------------------------
-- Escolas, contratos e pessoas
-- ---------------------------------------------------------------------

create table public.escolas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) between 2 and 200),
  cidade text not null check (length(trim(cidade)) between 2 and 120),
  uf char(2) not null check (uf ~ '^[A-Z]{2}$'),
  criada_em timestamptz not null default now()
);
comment on table public.escolas is 'Escolas clientes. Cadastradas pela administração.';

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas (id) on delete cascade,
  inicio date not null,
  fim date not null,
  limite_alunos integer check (limite_alunos > 0),
  criado_em timestamptz not null default now(),
  check (fim >= inicio)
);
create index contratos_escola_idx on public.contratos (escola_id, fim);
comment on table public.contratos is 'Período em que a escola tem acesso. Quando acaba, os alunos viram usuários gratuitos (rotina diária).';

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (length(trim(nome)) between 1 and 80),
  papel public.papel_usuario not null default 'aluno',
  -- só professor e coordenação pertencem a uma escola; a escola do aluno vem da matrícula
  escola_id uuid references public.escolas (id) on delete restrict,
  criado_em timestamptz not null default now(),
  check ((papel in ('professor', 'coordenacao')) = (escola_id is not null))
);
create index perfis_escola_idx on public.perfis (escola_id) where escola_id is not null;
comment on table public.perfis is 'Uma linha por conta do Supabase Auth. Guarda só o nome de exibição: e-mail e senha ficam no Auth.';
comment on column public.perfis.papel is 'Novo cadastro é sempre aluno. Professor, coordenação e admin são definidos pela administração no painel.';

create table public.termos_uso (
  versao integer primary key check (versao > 0),
  endereco text not null,
  publicado_em timestamptz not null default now()
);
comment on table public.termos_uso is 'Versões dos termos de uso. A vigente é a mais nova já publicada.';

create table public.aceites_termos (
  usuario_id uuid not null references public.perfis (id) on delete cascade,
  versao integer not null references public.termos_uso (versao),
  aceito_em timestamptz not null default now(),
  primary key (usuario_id, versao)
);

-- ---------------------------------------------------------------------
-- Turmas e matrículas
-- ---------------------------------------------------------------------

create table public.turmas (
  id uuid primary key default gen_random_uuid(),
  escola_id uuid not null references public.escolas (id) on delete cascade,
  nome text not null check (length(trim(nome)) between 1 and 80),
  serie text check (length(trim(serie)) between 1 and 40),
  -- 8 caracteres sem os que se confundem (0, O, 1, I, L); nulo quando arquivada
  codigo char(8) unique check (codigo ~ '^[A-HJKMNP-Z2-9]{8}$'),
  codigo_renovado_em timestamptz,
  criada_por uuid references public.perfis (id) on delete set null,
  criada_em timestamptz not null default now(),
  arquivada_em timestamptz,
  check ((arquivada_em is null) = (codigo is not null))
);
create index turmas_escola_idx on public.turmas (escola_id);

create table public.turma_professores (
  turma_id uuid not null references public.turmas (id) on delete cascade,
  professor_id uuid not null references public.perfis (id) on delete cascade,
  adicionado_em timestamptz not null default now(),
  adicionado_por uuid references public.perfis (id) on delete set null,
  primary key (turma_id, professor_id)
);
create index turma_professores_professor_idx on public.turma_professores (professor_id);

create table public.matriculas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.perfis (id) on delete cascade,
  turma_id uuid not null references public.turmas (id) on delete cascade,
  entrou_em timestamptz not null default now(),
  encerrada_em timestamptz,
  encerrada_por uuid references public.perfis (id) on delete set null,
  motivo public.motivo_encerramento,
  check ((encerrada_em is null) = (motivo is null))
);
-- um aluno fica em uma turma por vez
create unique index matriculas_uma_ativa_idx on public.matriculas (aluno_id) where encerrada_em is null;
create index matriculas_turma_idx on public.matriculas (turma_id) where encerrada_em is null;

-- protege o código da turma contra tentativa e erro
create table public.tentativas_codigo (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfis (id) on delete cascade,
  em timestamptz not null default now(),
  sucesso boolean not null
);
create index tentativas_codigo_usuario_idx on public.tentativas_codigo (usuario_id, em desc);

-- ---------------------------------------------------------------------
-- Conteúdo: módulos, aulas, questões
-- ---------------------------------------------------------------------

create table public.modulos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null unique check (numero > 0),
  titulo text not null,
  tema text not null,
  descricao text not null default '',
  publicado boolean not null default false
);

create table public.aulas (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid not null references public.modulos (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  numero integer not null check (numero > 0),
  titulo text not null,
  resumo text not null default '',
  -- um parágrafo por item
  texto text[] not null check (cardinality(texto) > 0),
  publicado boolean not null default false,
  unique (modulo_id, numero)
);

create table public.questoes (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas (id) on delete cascade,
  ordem integer not null check (ordem > 0),
  enunciado text not null,
  -- só aparece depois da resposta (função responder_questao)
  explicacao text not null,
  -- a questão só chega ao aluno depois da revisão de conteúdo (decisão D4)
  revisada_por text,
  revisada_em timestamptz,
  unique (aula_id, ordem),
  check ((revisada_por is null) = (revisada_em is null))
);

create table public.alternativas (
  id uuid primary key default gen_random_uuid(),
  questao_id uuid not null references public.questoes (id) on delete cascade,
  letra char(1) not null check (letra in ('A', 'B', 'C', 'D', 'E')),
  texto text not null,
  -- só aparece depois da resposta (função responder_questao)
  correta boolean not null default false,
  unique (questao_id, letra),
  unique (id, questao_id)
);
create unique index alternativas_uma_correta_idx on public.alternativas (questao_id) where correta;

-- ---------------------------------------------------------------------
-- Progresso do aluno
-- ---------------------------------------------------------------------

create table public.aulas_concluidas (
  aluno_id uuid not null references public.perfis (id) on delete cascade,
  aula_id uuid not null references public.aulas (id) on delete cascade,
  concluida_em timestamptz not null default now(),
  primary key (aluno_id, aula_id)
);
create index aulas_concluidas_data_idx on public.aulas_concluidas (concluida_em);

create table public.tentativas_quiz (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.perfis (id) on delete cascade,
  aula_id uuid not null references public.aulas (id) on delete cascade,
  iniciada_em timestamptz not null default now(),
  finalizada_em timestamptz,
  acertos integer check (acertos >= 0),
  total integer check (total > 0),
  check ((finalizada_em is null) = (acertos is null) and (finalizada_em is null) = (total is null))
);
create index tentativas_quiz_aluno_idx on public.tentativas_quiz (aluno_id, aula_id, iniciada_em desc);

create table public.respostas (
  tentativa_id uuid not null references public.tentativas_quiz (id) on delete cascade,
  questao_id uuid not null references public.questoes (id) on delete cascade,
  alternativa_id uuid not null,
  correta boolean not null,
  respondida_em timestamptz not null default now(),
  primary key (tentativa_id, questao_id),
  -- a alternativa precisa ser da mesma questão
  foreign key (alternativa_id, questao_id) references public.alternativas (id, questao_id) on delete cascade
);
create index respostas_questao_idx on public.respostas (questao_id, respondida_em);

-- ---------------------------------------------------------------------
-- Voto às Cegas
-- ---------------------------------------------------------------------

create table public.leis (
  id uuid primary key default gen_random_uuid(),
  fonte text not null check (fonte in ('camara', 'senado', 'exemplo')),
  id_externo text not null,
  rotulo text not null,
  tema text,
  ementa text not null,
  -- resumo escrito pela equipe; o app mostra este texto, e a ementa oficial fica como apoio
  resumo text,
  apresentada_em date,
  -- escondidos até a decisão (função registrar_decisao / revelar_autoria)
  autoria text not null,
  partido text,
  coautores integer not null default 0 check (coautores >= 0),
  link text,
  publicada boolean not null default false,
  unique (fonte, id_externo),
  -- leis escolhidas pela equipe: só vão ao ar com resumo e, se forem reais, com o link oficial
  check (not publicada or length(trim(coalesce(resumo, ''))) > 0),
  check (not publicada or fonte = 'exemplo' or link is not null)
);
create index leis_publicadas_idx on public.leis (apresentada_em desc nulls last, id) where publicada;
comment on column public.leis.partido is 'Partido atual do autor. A tela avisa que pode ser diferente do partido na época do projeto.';

create table public.sessoes_voto (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.perfis (id) on delete cascade,
  iniciada_em timestamptz not null default now(),
  concluida_em timestamptz
);
create unique index sessoes_voto_uma_aberta_idx on public.sessoes_voto (aluno_id) where concluida_em is null;

create table public.itens_sessao (
  sessao_id uuid not null references public.sessoes_voto (id) on delete cascade,
  lei_id uuid not null references public.leis (id) on delete cascade,
  posicao smallint not null check (posicao between 1 and 15),
  -- ordem na fila: pular manda a lei para o fim
  fila integer not null,
  pulos integer not null default 0 check (pulos >= 0),
  decidida_em timestamptz,
  primary key (sessao_id, lei_id),
  unique (sessao_id, posicao)
);

-- REGRA 1: só registra QUE houve decisão. Não existe coluna de voto, e nunca deve existir.
create table public.decisoes (
  aluno_id uuid not null references public.perfis (id) on delete cascade,
  lei_id uuid not null references public.leis (id) on delete cascade,
  sessao_id uuid references public.sessoes_voto (id) on delete set null,
  decidida_em timestamptz not null default now(),
  -- lei decidida não volta
  primary key (aluno_id, lei_id)
);
create index decisoes_data_idx on public.decisoes (decidida_em);
comment on table public.decisoes is 'Registra só que o aluno decidiu sobre a lei. O voto (aprovar ou rejeitar) nunca chega ao banco.';

-- ---------------------------------------------------------------------
-- Limites do usuário gratuito (recarga à meia-noite de Brasília: a chave é o dia)
-- ---------------------------------------------------------------------

create table public.uso_diario (
  usuario_id uuid not null references public.perfis (id) on delete cascade,
  dia date not null,
  -- cada vida é uma aula nova concluída no dia; errar no quiz não gasta vida
  vidas_usadas smallint not null default 0 check (vidas_usadas between 0 and 5),
  decisoes smallint not null default 0 check (decisoes between 0 and 5),
  primary key (usuario_id, dia)
);

-- ---------------------------------------------------------------------
-- Auditoria: quem alterou o quê nas tabelas cuidadas pela administração
-- ---------------------------------------------------------------------

create table public.auditoria (
  id bigint generated always as identity primary key,
  tabela text not null,
  operacao text not null check (operacao in ('INSERT', 'UPDATE', 'DELETE')),
  antes jsonb,
  depois jsonb,
  alterado_por uuid,
  papel_banco text not null default current_user,
  alterado_em timestamptz not null default now()
);
create index auditoria_tabela_idx on public.auditoria (tabela, alterado_em desc);

-- =====================================================================
-- Funções internas (schema privado)
-- =====================================================================

create function privado.dia_brasilia() returns date
language sql stable set search_path = ''
as $$ select (now() at time zone 'America/Sao_Paulo')::date $$;

create function privado.meu_papel() returns public.papel_usuario
language sql stable security definer set search_path = ''
as $$ select papel from public.perfis where id = auth.uid() $$;

create function privado.minha_escola() returns uuid
language sql stable security definer set search_path = ''
as $$ select escola_id from public.perfis where id = auth.uid() $$;

-- turma em que o aluno está agora (nula para usuário gratuito)
create function privado.turma_ativa(p_aluno uuid) returns uuid
language sql stable security definer set search_path = ''
as $$ select turma_id from public.matriculas where aluno_id = p_aluno and encerrada_em is null $$;

create function privado.leciona(p_turma uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.turma_professores tp
    join public.perfis p on p.id = tp.professor_id
    where tp.turma_id = p_turma and tp.professor_id = auth.uid() and p.papel = 'professor'
  )
$$;

-- professor da turma ou coordenação da escola da turma
create function privado.pode_ver_turma(p_turma uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select privado.leciona(p_turma) or exists (
    select 1 from public.turmas t
    join public.perfis p on p.id = auth.uid()
    where t.id = p_turma and p.papel = 'coordenacao' and p.escola_id = t.escola_id
  )
$$;

-- o próprio aluno, ou professor e coordenação de uma turma em que ele esteve
create function privado.pode_ver_aluno(p_aluno uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_aluno = auth.uid() or exists (
    select 1 from public.matriculas m where m.aluno_id = p_aluno and privado.pode_ver_turma(m.turma_id)
  )
$$;

create function privado.escola_tem_contrato(p_escola uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.contratos c
    where c.escola_id = p_escola and privado.dia_brasilia() between c.inicio and c.fim
  )
$$;

create function privado.erro(p_codigo text, p_detalhe text) returns void
language plpgsql set search_path = ''
as $$ begin raise exception using message = p_codigo, detail = p_detalhe, errcode = 'P0001'; end $$;

-- confere login, papel e aceite da versão vigente dos termos
create function privado.exigir(p_papeis public.papel_usuario[]) returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_papel public.papel_usuario;
  v_vigente integer;
begin
  if v_usuario is null then
    perform privado.erro('sem_login', 'Entre na sua conta para continuar.');
  end if;
  select papel into v_papel from public.perfis where id = v_usuario;
  if v_papel is null or not (v_papel = any (p_papeis)) then
    perform privado.erro('sem_permissao', 'Sua conta não pode fazer isso.');
  end if;
  select max(versao) into v_vigente from public.termos_uso where publicado_em <= now();
  if v_vigente is not null and not exists (
    select 1 from public.aceites_termos where usuario_id = v_usuario and versao = v_vigente
  ) then
    perform privado.erro('termos_pendentes', 'Aceite a versão atual dos termos de uso para continuar.');
  end if;
  return v_usuario;
end
$$;

-- aulas liberam em sequência: a anterior precisa estar concluída (a 1 do módulo
-- seguinte depende da última do módulo anterior)
create function privado.aula_liberada(p_aluno uuid, p_aula uuid) returns boolean
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
      and (o.anterior is null or exists (
        select 1 from public.aulas_concluidas c where c.aluno_id = p_aluno and c.aula_id = o.anterior
      ))
  )
$$;

-- código de 8 caracteres com aleatoriedade forte (gen_random_uuid usa o gerador seguro do PostgreSQL)
create function privado.gerar_codigo() returns char(8)
language plpgsql volatile set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea;
  v_codigo text;
begin
  loop
    bytes := uuid_send(gen_random_uuid());
    v_codigo := '';
    for i in 0..7 loop
      v_codigo := v_codigo || substr(alfabeto, (get_byte(bytes, i) % 31) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.turmas t where t.codigo = v_codigo);
  end loop;
  return v_codigo;
end
$$;

-- usuário gratuito: aluno sem matrícula ativa
create function privado.eh_gratuito(p_aluno uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.perfis where id = p_aluno and papel = 'aluno')
     and privado.turma_ativa(p_aluno) is null
$$;

-- =====================================================================
-- Gatilhos
-- =====================================================================

-- toda conta nova do Auth vira um perfil de aluno
create function privado.criar_perfil() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), 'Estudante'));
  return new;
end
$$;

create trigger criar_perfil_ao_cadastrar
  after insert on auth.users
  for each row execute function privado.criar_perfil();

create function privado.auditar() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.auditoria (tabela, operacao, antes, depois, alterado_por)
  values (
    tg_table_name,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    auth.uid()
  );
  return coalesce(new, old);
end
$$;

do $$
declare t text;
begin
  foreach t in array array['escolas', 'contratos', 'perfis', 'termos_uso', 'turma_professores', 'modulos', 'aulas', 'questoes', 'alternativas', 'leis']
  loop
    execute format('create trigger auditar after insert or update or delete on public.%I for each row execute function privado.auditar()', t);
  end loop;
end
$$;

-- =====================================================================
-- Funções do app (RPC). Todas checam quem chama; nenhuma recebe o voto.
-- =====================================================================

-- ---------- Conta ----------

create function public.aceitar_termos(p_versao integer) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_vigente integer;
begin
  if auth.uid() is null then perform privado.erro('sem_login', 'Entre na sua conta para continuar.'); end if;
  select max(versao) into v_vigente from public.termos_uso where publicado_em <= now();
  if p_versao is distinct from v_vigente then
    perform privado.erro('versao_invalida', 'Essa não é a versão atual dos termos de uso.');
  end if;
  insert into public.aceites_termos (usuario_id, versao) values (auth.uid(), p_versao) on conflict do nothing;
end
$$;

create function public.atualizar_nome(p_nome text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then perform privado.erro('sem_login', 'Entre na sua conta para continuar.'); end if;
  if length(trim(coalesce(p_nome, ''))) not between 1 and 80 then
    perform privado.erro('nome_invalido', 'O nome precisa ter de 1 a 80 caracteres.');
  end if;
  update public.perfis set nome = trim(p_nome) where id = auth.uid();
end
$$;

-- tudo que a tela inicial precisa saber sobre quem está logado
create function public.minha_conta()
returns table (nome text, papel public.papel_usuario, gratuito boolean, turma_id uuid, turma_nome text, escola_nome text, termos_pendentes boolean)
language sql stable security definer set search_path = ''
as $$
  select p.nome, p.papel, privado.eh_gratuito(p.id), t.id, t.nome, coalesce(e.nome, ep.nome),
    exists (select 1 from public.termos_uso tu where tu.publicado_em <= now()
            and tu.versao = (select max(versao) from public.termos_uso where publicado_em <= now())
            and not exists (select 1 from public.aceites_termos a where a.usuario_id = p.id and a.versao = tu.versao))
  from public.perfis p
  left join public.turmas t on t.id = privado.turma_ativa(p.id)
  left join public.escolas e on e.id = t.escola_id
  left join public.escolas ep on ep.id = p.escola_id
  where p.id = auth.uid()
$$;

-- vidas e decisões que sobram hoje; nulos para quem não tem limite
create function public.meus_limites()
returns table (vidas_restantes integer, decisoes_restantes integer, recarrega_em timestamptz)
language sql stable security definer set search_path = ''
as $$
  select
    case when privado.eh_gratuito(auth.uid()) then 5 - coalesce(u.vidas_usadas, 0) end,
    case when privado.eh_gratuito(auth.uid()) then 5 - coalesce(u.decisoes, 0) end,
    case when privado.eh_gratuito(auth.uid())
      then ((privado.dia_brasilia() + 1)::timestamp at time zone 'America/Sao_Paulo') end
  from (select 1) x
  left join public.uso_diario u on u.usuario_id = auth.uid() and u.dia = privado.dia_brasilia()
  where auth.uid() is not null
$$;

-- ---------- Aluno: turma ----------

create function public.entrar_na_turma(p_codigo text)
returns table (turma_id uuid, turma_nome text, escola_nome text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_codigo text := upper(regexp_replace(coalesce(p_codigo, ''), '[^A-Za-z0-9]', '', 'g'));
  v_turma public.turmas;
  v_atual uuid;
  v_limite integer;
  v_ativos integer;
begin
  -- no máximo 10 códigos errados por hora
  if (select count(*) from public.tentativas_codigo
      where usuario_id = v_aluno and not sucesso and em > now() - interval '1 hour') >= 10 then
    perform privado.erro('muitas_tentativas', 'Muitos códigos errados. Tente de novo daqui a uma hora.');
  end if;

  select * into v_turma from public.turmas where codigo = v_codigo and arquivada_em is null;
  if v_turma.id is null then
    -- código errado não levanta erro: um erro desfaria o registro da tentativa
    -- e o limite acima nunca chegaria. O app trata "nenhuma linha" como código inválido.
    insert into public.tentativas_codigo (usuario_id, sucesso) values (v_aluno, false);
    return;
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

-- ---------- Aluno: aprender ----------

create function public.minha_trilha()
returns table (
  modulo_numero integer, modulo_titulo text, aula_id uuid, slug text, numero integer, titulo text, resumo text,
  total_questoes integer, liberada boolean, concluida boolean, melhor_acertos integer, tentativas integer
)
language sql stable security definer set search_path = ''
as $$
  select m.numero, m.titulo, a.id, a.slug, a.numero, a.titulo, a.resumo,
    (select count(*)::int from public.questoes q where q.aula_id = a.id and q.revisada_em is not null),
    privado.aula_liberada(auth.uid(), a.id),
    exists (select 1 from public.aulas_concluidas c where c.aluno_id = auth.uid() and c.aula_id = a.id),
    (select max(t.acertos) from public.tentativas_quiz t where t.aluno_id = auth.uid() and t.aula_id = a.id),
    (select count(*)::int from public.tentativas_quiz t where t.aluno_id = auth.uid() and t.aula_id = a.id and t.finalizada_em is not null)
  from public.aulas a join public.modulos m on m.id = a.modulo_id
  where a.publicado and m.publicado and auth.uid() is not null
  order by m.numero, a.numero
$$;

-- Usuário gratuito: cada aula nova concluída gasta uma das 5 vidas do dia.
-- Rever aula já concluída e errar no quiz não gastam nada. Aluno de turma não tem limite.
create function public.concluir_aula(p_aula uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_usadas integer;
begin
  if not privado.aula_liberada(v_aluno, p_aula) then
    perform privado.erro('aula_bloqueada', 'Conclua a aula anterior primeiro.');
  end if;
  if exists (select 1 from public.aulas_concluidas where aluno_id = v_aluno and aula_id = p_aula) then
    return;
  end if;
  if privado.eh_gratuito(v_aluno) then
    insert into public.uso_diario (usuario_id, dia) values (v_aluno, privado.dia_brasilia()) on conflict do nothing;
    update public.uso_diario set vidas_usadas = vidas_usadas + 1
    where usuario_id = v_aluno and dia = privado.dia_brasilia() and vidas_usadas < 5
    returning vidas_usadas into v_usadas;
    if v_usadas is null then
      perform privado.erro('sem_vidas', 'Suas aulas novas de hoje acabaram. Elas voltam à meia-noite.');
    end if;
  end if;
  insert into public.aulas_concluidas (aluno_id, aula_id) values (v_aluno, p_aula);
end
$$;

-- perguntas da aula, sem dizer qual é a certa
create function public.questoes_da_aula(p_aula uuid)
returns table (questao_id uuid, ordem integer, enunciado text, alternativas jsonb)
language sql stable security definer set search_path = ''
as $$
  select q.id, q.ordem, q.enunciado,
    (select jsonb_agg(jsonb_build_object('id', al.id, 'letra', al.letra, 'texto', al.texto) order by al.letra)
     from public.alternativas al where al.questao_id = q.id)
  from public.questoes q
  join public.aulas a on a.id = q.aula_id and a.publicado
  where q.aula_id = p_aula and q.revisada_em is not null and auth.uid() is not null
  order by q.ordem
$$;

create function public.iniciar_tentativa(p_aula uuid) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_id uuid;
begin
  -- o quiz vem depois da leitura
  if not exists (select 1 from public.aulas_concluidas where aluno_id = v_aluno and aula_id = p_aula) then
    perform privado.erro('aula_nao_concluida', 'Leia a aula e marque como concluída antes do quiz.');
  end if;
  if not exists (select 1 from public.questoes where aula_id = p_aula and revisada_em is not null) then
    perform privado.erro('quiz_em_revisao', 'O quiz desta aula ainda está em revisão.');
  end if;
  insert into public.tentativas_quiz (aluno_id, aula_id) values (v_aluno, p_aula) returning id into v_id;
  return v_id;
end
$$;

create function public.responder_questao(p_tentativa uuid, p_questao uuid, p_alternativa uuid)
returns table (correta boolean, alternativa_correta uuid, explicacao text)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_tentativa public.tentativas_quiz;
  v_certa uuid;
  v_acertou boolean;
begin
  select * into v_tentativa from public.tentativas_quiz where id = p_tentativa and aluno_id = v_aluno for update;
  if v_tentativa.id is null then
    perform privado.erro('tentativa_invalida', 'Tentativa de quiz não encontrada.');
  end if;
  if v_tentativa.finalizada_em is not null then
    perform privado.erro('tentativa_finalizada', 'Este quiz já terminou. Comece outra tentativa.');
  end if;
  if not exists (select 1 from public.questoes where id = p_questao and aula_id = v_tentativa.aula_id and revisada_em is not null) then
    perform privado.erro('questao_invalida', 'Essa pergunta não é deste quiz.');
  end if;
  if not exists (select 1 from public.alternativas where id = p_alternativa and questao_id = p_questao) then
    perform privado.erro('alternativa_invalida', 'Essa alternativa não é desta pergunta.');
  end if;
  if exists (select 1 from public.respostas where tentativa_id = p_tentativa and questao_id = p_questao) then
    perform privado.erro('ja_respondida', 'Você já respondeu esta pergunta nesta tentativa.');
  end if;

  select id into v_certa from public.alternativas where questao_id = p_questao and alternativas.correta;
  v_acertou := v_certa = p_alternativa;
  insert into public.respostas (tentativa_id, questao_id, alternativa_id, correta)
  values (p_tentativa, p_questao, p_alternativa, v_acertou);

  -- errar não gasta vida: as vidas só limitam aulas novas por dia
  return query select v_acertou, v_certa, (select q.explicacao from public.questoes q where q.id = p_questao);
end
$$;

create function public.finalizar_tentativa(p_tentativa uuid)
returns table (acertos integer, total integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_tentativa public.tentativas_quiz;
  v_acertos integer;
  v_total integer;
begin
  select * into v_tentativa from public.tentativas_quiz where id = p_tentativa and aluno_id = v_aluno for update;
  if v_tentativa.id is null then perform privado.erro('tentativa_invalida', 'Tentativa de quiz não encontrada.'); end if;
  if v_tentativa.finalizada_em is not null then
    return query select v_tentativa.acertos, v_tentativa.total;
    return;
  end if;
  select count(*) into v_total from public.questoes where aula_id = v_tentativa.aula_id and revisada_em is not null;
  if (select count(*) from public.respostas where tentativa_id = p_tentativa) < v_total then
    perform privado.erro('quiz_incompleto', 'Responda todas as perguntas antes de terminar.');
  end if;
  select count(*) filter (where r.correta) into v_acertos from public.respostas r where r.tentativa_id = p_tentativa;
  update public.tentativas_quiz set finalizada_em = now(), acertos = v_acertos, total = v_total where id = p_tentativa;
  return query select v_acertos, v_total;
end
$$;

-- ---------- Aluno: Voto às Cegas ----------

-- abre (ou retoma) a sessão de até 15 leis; devolve a fila sem autoria
create function public.sessao_voto()
returns table (sessao_id uuid, lei_id uuid, posicao smallint, rotulo text, tema text, ementa text, resumo text, decidida boolean, total integer)
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
    -- critério mecânico e público: as mais recentes ainda não decididas
    insert into public.itens_sessao (sessao_id, lei_id, posicao, fila)
    select v_sessao, l.id, row_number() over w, row_number() over w
    from public.leis l
    where l.publicada and not exists (select 1 from public.decisoes d where d.aluno_id = v_aluno and d.lei_id = l.id)
    window w as (order by l.apresentada_em desc nulls last, l.id)
    order by l.apresentada_em desc nulls last, l.id
    limit 15;
  end if;
  return query
    select v_sessao, l.id, i.posicao, l.rotulo, l.tema, l.ementa, l.resumo, i.decidida_em is not null,
      (select count(*)::int from public.itens_sessao x where x.sessao_id = v_sessao)
    from public.itens_sessao i join public.leis l on l.id = i.lei_id
    where i.sessao_id = v_sessao
    -- decididas primeiro (para a contagem "3 de 15"), depois a fila; pular manda para o fim
    order by i.decidida_em is null, i.decidida_em, i.fila;
end
$$;

-- pular não conta: a lei vai para o fim da fila e volta depois
create function public.pular_lei(p_sessao uuid, p_lei uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
begin
  update public.itens_sessao i
  set pulos = pulos + 1,
      fila = (select max(x.fila) + 1 from public.itens_sessao x where x.sessao_id = p_sessao)
  from public.sessoes_voto s
  where i.sessao_id = p_sessao and i.lei_id = p_lei and i.decidida_em is null
    and s.id = i.sessao_id and s.aluno_id = v_aluno and s.concluida_em is null;
  if not found then perform privado.erro('lei_invalida', 'Essa lei não está pendente na sua sessão.'); end if;
end
$$;

-- REGRA 1: recebe só a lei. O voto fica na tela do aluno e nunca chega aqui.
-- Devolve a autoria, que só pode ser vista depois da decisão.
create function public.registrar_decisao(p_sessao uuid, p_lei uuid)
returns table (autoria text, partido text, coautores integer, link text, exemplo boolean, sessao_concluida boolean, decisoes_restantes integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_aluno uuid := privado.exigir(array['aluno']::public.papel_usuario[]);
  v_gratuito boolean := privado.eh_gratuito(v_aluno);
  v_usadas integer;
  v_concluida boolean;
begin
  if not exists (
    select 1 from public.itens_sessao i join public.sessoes_voto s on s.id = i.sessao_id
    where i.sessao_id = p_sessao and i.lei_id = p_lei and i.decidida_em is null
      and s.aluno_id = v_aluno and s.concluida_em is null
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

  v_concluida := not exists (select 1 from public.itens_sessao where sessao_id = p_sessao and decidida_em is null);
  if v_concluida then
    update public.sessoes_voto set concluida_em = now() where id = p_sessao;
  end if;

  return query select l.autoria, l.partido, l.coautores, l.link, l.fonte = 'exemplo', v_concluida,
    case when v_gratuito then 5 - v_usadas end
  from public.leis l where l.id = p_lei;
end
$$;

-- para mostrar de novo a autoria (ex.: depois de recarregar a página); só de lei já decidida
create function public.revelar_autoria(p_lei uuid)
returns table (autoria text, partido text, coautores integer, link text, exemplo boolean)
language sql stable security definer set search_path = ''
as $$
  select l.autoria, l.partido, l.coautores, l.link, l.fonte = 'exemplo'
  from public.leis l
  where l.id = p_lei and exists (select 1 from public.decisoes d where d.aluno_id = auth.uid() and d.lei_id = p_lei)
$$;

-- ---------- Professor: turmas ----------

create function public.criar_turma(p_nome text, p_serie text default null)
returns table (turma_id uuid, codigo char(8))
language plpgsql security definer set search_path = ''
as $$
declare
  v_prof uuid := privado.exigir(array['professor']::public.papel_usuario[]);
  v_escola uuid := privado.minha_escola();
  v_id uuid;
  v_codigo char(8) := privado.gerar_codigo();
begin
  if not privado.escola_tem_contrato(v_escola) then
    perform privado.erro('escola_sem_contrato', 'A escola não está com o acesso ativo.');
  end if;
  insert into public.turmas (escola_id, nome, serie, codigo, codigo_renovado_em, criada_por)
  values (v_escola, trim(p_nome), nullif(trim(p_serie), ''), v_codigo, now(), v_prof)
  returning id into v_id;
  insert into public.turma_professores (turma_id, professor_id, adicionado_por) values (v_id, v_prof, v_prof);
  return query select v_id, v_codigo;
end
$$;

create function public.editar_turma(p_turma uuid, p_nome text, p_serie text default null) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform privado.exigir(array['professor']::public.papel_usuario[]);
  if not privado.leciona(p_turma) then perform privado.erro('sem_permissao', 'Você não é professor desta turma.'); end if;
  update public.turmas set nome = trim(p_nome), serie = nullif(trim(p_serie), '') where id = p_turma;
end
$$;

-- arquivar desativa o código; os alunos continuam matriculados até a coordenação encerrar
create function public.arquivar_turma(p_turma uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform privado.exigir(array['professor']::public.papel_usuario[]);
  if not privado.leciona(p_turma) then perform privado.erro('sem_permissao', 'Você não é professor desta turma.'); end if;
  update public.turmas set arquivada_em = now(), codigo = null where id = p_turma and arquivada_em is null;
end
$$;

create function public.renovar_codigo(p_turma uuid) returns char(8)
language plpgsql security definer set search_path = ''
as $$
declare v_codigo char(8) := privado.gerar_codigo();
begin
  perform privado.exigir(array['professor']::public.papel_usuario[]);
  if not privado.leciona(p_turma) then perform privado.erro('sem_permissao', 'Você não é professor desta turma.'); end if;
  update public.turmas set codigo = v_codigo, codigo_renovado_em = now() where id = p_turma and arquivada_em is null;
  if not found then perform privado.erro('turma_arquivada', 'Turma arquivada não tem código.'); end if;
  return v_codigo;
end
$$;

-- professores da mesma escola que podem ser chamados para a turma
create function public.professores_da_escola()
returns table (professor_id uuid, nome text)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.nome from public.perfis p
  where p.papel = 'professor' and p.escola_id = privado.minha_escola()
    and privado.meu_papel() in ('professor', 'coordenacao')
  order by p.nome
$$;

create function public.adicionar_professor(p_turma uuid, p_professor uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_prof uuid := privado.exigir(array['professor']::public.papel_usuario[]);
begin
  if not privado.leciona(p_turma) then perform privado.erro('sem_permissao', 'Você não é professor desta turma.'); end if;
  if not exists (
    select 1 from public.perfis p join public.turmas t on t.escola_id = p.escola_id
    where p.id = p_professor and p.papel = 'professor' and t.id = p_turma
  ) then
    perform privado.erro('professor_invalido', 'Só dá para adicionar professores da mesma escola.');
  end if;
  insert into public.turma_professores (turma_id, professor_id, adicionado_por)
  values (p_turma, p_professor, v_prof) on conflict do nothing;
end
$$;

-- ---------- Professor e coordenação: painel ----------
-- Período padrão: últimos 7 dias. Nenhuma destas funções devolve voto: só contagens.

create function privado.exigir_turma(p_turma uuid) returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform privado.exigir(array['professor', 'coordenacao']::public.papel_usuario[]);
  if not privado.pode_ver_turma(p_turma) then
    perform privado.erro('sem_permissao', 'Você não acompanha esta turma.');
  end if;
end
$$;

create function public.painel_indicadores(p_turma uuid, p_de date default null, p_ate date default null)
returns table (alunos_matriculados integer, alunos_ativos integer, aulas_concluidas integer, acerto_quizzes numeric, decisoes_voto integer)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_ate date := coalesce(p_ate, privado.dia_brasilia());
  v_de date := coalesce(p_de, v_ate - 6);
  v_ini timestamptz := v_de::timestamp at time zone 'America/Sao_Paulo';
  v_fim timestamptz := (v_ate + 1)::timestamp at time zone 'America/Sao_Paulo';
begin
  perform privado.exigir_turma(p_turma);
  return query
  with alunos as (select aluno_id from public.matriculas where turma_id = p_turma and encerrada_em is null),
  aulas as (select c.aluno_id from public.aulas_concluidas c join alunos a using (aluno_id) where c.concluida_em >= v_ini and c.concluida_em < v_fim),
  resp as (select t.aluno_id, r.correta from public.respostas r join public.tentativas_quiz t on t.id = r.tentativa_id
           join alunos a on a.aluno_id = t.aluno_id where r.respondida_em >= v_ini and r.respondida_em < v_fim),
  dec as (select d.aluno_id from public.decisoes d join alunos a using (aluno_id) where d.decidida_em >= v_ini and d.decidida_em < v_fim)
  select
    (select count(*)::int from alunos),
    (select count(distinct x.aluno_id)::int from (select aluno_id from aulas union select aluno_id from resp union select aluno_id from dec) x),
    (select count(*)::int from aulas),
    (select round(100.0 * count(*) filter (where correta) / nullif(count(*), 0), 1) from resp),
    (select count(*)::int from dec);
end
$$;

create function public.progresso_por_aula(p_turma uuid)
returns table (modulo_numero integer, aula_id uuid, numero integer, titulo text, alunos_concluiram integer, alunos_matriculados integer, acerto_medio numeric)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform privado.exigir_turma(p_turma);
  return query
  with alunos as (select aluno_id from public.matriculas where turma_id = p_turma and encerrada_em is null)
  select m.numero, a.id, a.numero, a.titulo,
    (select count(*)::int from public.aulas_concluidas c join alunos al using (aluno_id) where c.aula_id = a.id),
    (select count(*)::int from alunos),
    (select round(100.0 * sum(t.acertos) / nullif(sum(t.total), 0), 1)
       from public.tentativas_quiz t join alunos al using (aluno_id)
       where t.aula_id = a.id and t.finalizada_em is not null)
  from public.aulas a join public.modulos m on m.id = a.modulo_id
  where a.publicado and m.publicado
  order by m.numero, a.numero;
end
$$;

create function public.desempenho_alunos(p_turma uuid, p_de date default null, p_ate date default null)
returns table (aluno_id uuid, nome text, aulas_concluidas integer, quizzes_feitos integer, acerto numeric, decisoes_voto integer, ultima_atividade timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_ate date := coalesce(p_ate, privado.dia_brasilia());
  v_de date := coalesce(p_de, v_ate - 6);
  v_ini timestamptz := v_de::timestamp at time zone 'America/Sao_Paulo';
  v_fim timestamptz := (v_ate + 1)::timestamp at time zone 'America/Sao_Paulo';
begin
  perform privado.exigir_turma(p_turma);
  return query
  select p.id, p.nome,
    (select count(*)::int from public.aulas_concluidas c where c.aluno_id = p.id and c.concluida_em >= v_ini and c.concluida_em < v_fim),
    (select count(*)::int from public.tentativas_quiz t where t.aluno_id = p.id and t.finalizada_em >= v_ini and t.finalizada_em < v_fim),
    (select round(100.0 * count(*) filter (where r.correta) / nullif(count(*), 0), 1)
       from public.respostas r join public.tentativas_quiz t on t.id = r.tentativa_id
       where t.aluno_id = p.id and r.respondida_em >= v_ini and r.respondida_em < v_fim),
    (select count(*)::int from public.decisoes d where d.aluno_id = p.id and d.decidida_em >= v_ini and d.decidida_em < v_fim),
    greatest(
      (select max(c.concluida_em) from public.aulas_concluidas c where c.aluno_id = p.id),
      (select max(r.respondida_em) from public.respostas r join public.tentativas_quiz t on t.id = r.tentativa_id where t.aluno_id = p.id),
      (select max(d.decidida_em) from public.decisoes d where d.aluno_id = p.id))
  from public.matriculas m join public.perfis p on p.id = m.aluno_id
  where m.turma_id = p_turma and m.encerrada_em is null
  order by p.nome;
end
$$;

create function public.questoes_com_mais_erro(p_turma uuid, p_de date default null, p_ate date default null, p_limite integer default 5)
returns table (questao_id uuid, aula_titulo text, enunciado text, respostas integer, erros integer, percentual_erro numeric)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_ate date := coalesce(p_ate, privado.dia_brasilia());
  v_de date := coalesce(p_de, v_ate - 6);
  v_ini timestamptz := v_de::timestamp at time zone 'America/Sao_Paulo';
  v_fim timestamptz := (v_ate + 1)::timestamp at time zone 'America/Sao_Paulo';
begin
  perform privado.exigir_turma(p_turma);
  return query
  select q.id, a.titulo, q.enunciado, count(*)::int, (count(*) filter (where not r.correta))::int,
    round(100.0 * count(*) filter (where not r.correta) / count(*), 1)
  from public.respostas r
  join public.tentativas_quiz t on t.id = r.tentativa_id
  join public.matriculas m on m.aluno_id = t.aluno_id and m.turma_id = p_turma and m.encerrada_em is null
  join public.questoes q on q.id = r.questao_id
  join public.aulas a on a.id = q.aula_id
  where r.respondida_em >= v_ini and r.respondida_em < v_fim
  group by q.id, a.titulo, q.enunciado
  having count(*) filter (where not r.correta) > 0
  order by 6 desc, 5 desc
  limit least(greatest(coalesce(p_limite, 5), 1), 50);
end
$$;

-- tema com menor acerto e a aula sugerida para a próxima aula da turma
create function public.sugestao_proxima_aula(p_turma uuid)
returns table (tema_menor_acerto text, acerto numeric, aula_sugerida_id uuid, aula_sugerida_titulo text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform privado.exigir_turma(p_turma);
  return query
  with alunos as (select aluno_id from public.matriculas where turma_id = p_turma and encerrada_em is null),
  por_aula as (
    select a.id, a.titulo, m.tema, round(100.0 * sum(t.acertos) / nullif(sum(t.total), 0), 1) as acerto
    from public.tentativas_quiz t join alunos al using (aluno_id)
    join public.aulas a on a.id = t.aula_id join public.modulos m on m.id = a.modulo_id
    where t.finalizada_em is not null
    group by a.id, a.titulo, m.tema
  )
  select p.tema, p.acerto, p.id, p.titulo from por_aula p order by p.acerto asc, p.titulo limit 1;
end
$$;

-- linhas do relatório em CSV (o app monta o arquivo)
create function public.relatorio_turma(p_turma uuid, p_de date default null, p_ate date default null)
returns table (aluno text, aulas_concluidas integer, quizzes_feitos integer, acerto_percentual numeric, decisoes_voto integer, ultima_atividade timestamptz)
language sql stable security definer set search_path = ''
as $$
  select nome, aulas_concluidas, quizzes_feitos, acerto, decisoes_voto, ultima_atividade
  from public.desempenho_alunos(p_turma, p_de, p_ate)
$$;

-- ---------- Coordenação ----------

create function public.painel_escola(p_de date default null, p_ate date default null)
returns table (turma_id uuid, turma_nome text, arquivada boolean, alunos_matriculados integer, alunos_ativos integer, aulas_concluidas integer, acerto_quizzes numeric, decisoes_voto integer)
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform privado.exigir(array['coordenacao']::public.papel_usuario[]);
  return query
  select t.id, t.nome, t.arquivada_em is not null, i.*
  from public.turmas t
  cross join lateral public.painel_indicadores(t.id, p_de, p_ate) i
  where t.escola_id = privado.minha_escola()
  order by t.arquivada_em is not null, t.nome;
end
$$;

-- o aluno deixa a turma e passa a ser usuário gratuito
create function public.encerrar_matricula(p_aluno uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare v_coord uuid := privado.exigir(array['coordenacao']::public.papel_usuario[]);
begin
  update public.matriculas m set encerrada_em = now(), encerrada_por = v_coord, motivo = 'coordenacao'
  from public.turmas t
  where m.aluno_id = p_aluno and m.encerrada_em is null and t.id = m.turma_id and t.escola_id = privado.minha_escola();
  if not found then perform privado.erro('matricula_nao_encontrada', 'Este aluno não tem matrícula ativa na sua escola.'); end if;
end
$$;

-- ---------- Rotina diária (pg_cron) ----------

-- quando o contrato de uma escola acaba, os alunos viram usuários gratuitos
create function privado.rotina_diaria() returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_total integer;
begin
  update public.matriculas m set encerrada_em = now(), motivo = 'contrato_encerrado'
  from public.turmas t
  where m.encerrada_em is null and t.id = m.turma_id and not privado.escola_tem_contrato(t.escola_id);
  get diagnostics v_total = row_count;
  -- tentativas de código antigas não servem mais
  delete from public.tentativas_codigo where em < now() - interval '30 days';
  return v_total;
end
$$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- 00:05 em Brasília (03:05 UTC)
    perform cron.schedule('politiq-rotina-diaria', '5 3 * * *', 'select privado.rotina_diaria()');
  else
    raise notice 'pg_cron não está ativo: ative a extensão e agende privado.rotina_diaria() às 03:05 UTC.';
  end if;
end
$$;

-- =====================================================================
-- Permissões e RLS
-- =====================================================================

-- O Supabase dá acesso total às tabelas novas para anon e authenticated: tira tudo.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
revoke all on all functions in schema privado from public, anon, authenticated;
revoke all on schema privado from public, anon, authenticated;

-- as políticas RLS chamam estas funções com o papel de quem consulta
grant usage on schema privado to authenticated;
grant execute on function privado.meu_papel(), privado.minha_escola(), privado.leciona(uuid),
  privado.pode_ver_turma(uuid), privado.pode_ver_aluno(uuid), privado.turma_ativa(uuid) to authenticated;

-- funções do app
grant execute on function
  public.aceitar_termos(integer), public.atualizar_nome(text), public.minha_conta(), public.meus_limites(),
  public.entrar_na_turma(text), public.minha_trilha(), public.concluir_aula(uuid), public.questoes_da_aula(uuid),
  public.iniciar_tentativa(uuid), public.responder_questao(uuid, uuid, uuid), public.finalizar_tentativa(uuid),
  public.sessao_voto(), public.pular_lei(uuid, uuid), public.registrar_decisao(uuid, uuid), public.revelar_autoria(uuid),
  public.criar_turma(text, text), public.editar_turma(uuid, text, text), public.arquivar_turma(uuid),
  public.renovar_codigo(uuid), public.professores_da_escola(), public.adicionar_professor(uuid, uuid),
  public.painel_indicadores(uuid, date, date), public.progresso_por_aula(uuid), public.desempenho_alunos(uuid, date, date),
  public.questoes_com_mais_erro(uuid, date, date, integer), public.sugestao_proxima_aula(uuid),
  public.relatorio_turma(uuid, date, date), public.painel_escola(date, date), public.encerrar_matricula(uuid)
to authenticated;

-- leitura direta (sempre filtrada pelo RLS); colunas sensíveis ficam de fora
grant select on public.escolas, public.perfis, public.turmas, public.turma_professores, public.matriculas,
  public.modulos, public.aulas, public.aulas_concluidas, public.tentativas_quiz, public.respostas,
  public.sessoes_voto, public.itens_sessao, public.decisoes, public.uso_diario, public.aceites_termos
to authenticated;
grant select on public.termos_uso to anon, authenticated;
grant select (id, aula_id, ordem, enunciado) on public.questoes to authenticated;
grant select (id, questao_id, letra, texto) on public.alternativas to authenticated;
grant select (id, fonte, id_externo, rotulo, tema, ementa, resumo, apresentada_em, publicada) on public.leis to authenticated;

do $$
declare t text;
begin
  foreach t in array array['escolas', 'contratos', 'perfis', 'termos_uso', 'aceites_termos', 'turmas', 'turma_professores',
    'matriculas', 'tentativas_codigo', 'modulos', 'aulas', 'questoes', 'alternativas', 'aulas_concluidas', 'tentativas_quiz',
    'respostas', 'leis', 'sessoes_voto', 'itens_sessao', 'decisoes', 'uso_diario', 'auditoria']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end
$$;

-- contratos, tentativas_codigo e auditoria: sem política, ninguém do app lê

create policy "termos: todos leem" on public.termos_uso for select to anon, authenticated using (true);

create policy "escolas: a própria" on public.escolas for select to authenticated
  using (id = (select privado.minha_escola())
         or id in (select t.escola_id from public.turmas t where t.id = (select privado.turma_ativa(auth.uid()))));

create policy "perfis: o próprio e quem acompanha" on public.perfis for select to authenticated
  using (id = (select auth.uid())
         or (papel = 'aluno' and privado.pode_ver_aluno(id))
         or (papel in ('professor', 'coordenacao') and escola_id = (select privado.minha_escola())));

create policy "aceites: os próprios" on public.aceites_termos for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "turmas: professor, coordenação e aluno matriculado" on public.turmas for select to authenticated
  using (privado.pode_ver_turma(id) or id = (select privado.turma_ativa(auth.uid())));

create policy "turma_professores: quem vê a turma" on public.turma_professores for select to authenticated
  using (privado.pode_ver_turma(turma_id));

create policy "matriculas: o aluno e quem acompanha a turma" on public.matriculas for select to authenticated
  using (aluno_id = (select auth.uid()) or privado.pode_ver_turma(turma_id));

create policy "modulos: publicados" on public.modulos for select to authenticated using (publicado);
create policy "aulas: publicadas" on public.aulas for select to authenticated
  using (publicado and exists (select 1 from public.modulos m where m.id = modulo_id and m.publicado));
create policy "questoes: revisadas, de aulas publicadas" on public.questoes for select to authenticated
  using (revisada_em is not null and exists (select 1 from public.aulas a where a.id = aula_id and a.publicado));
create policy "alternativas: de questões visíveis" on public.alternativas for select to authenticated
  using (exists (select 1 from public.questoes q join public.aulas a on a.id = q.aula_id
                 where q.id = questao_id and q.revisada_em is not null and a.publicado));

create policy "aulas_concluidas: o aluno e quem acompanha" on public.aulas_concluidas for select to authenticated
  using (privado.pode_ver_aluno(aluno_id));
create policy "tentativas: o aluno e quem acompanha" on public.tentativas_quiz for select to authenticated
  using (privado.pode_ver_aluno(aluno_id));
create policy "respostas: o aluno e quem acompanha" on public.respostas for select to authenticated
  using (exists (select 1 from public.tentativas_quiz t where t.id = tentativa_id and privado.pode_ver_aluno(t.aluno_id)));

create policy "leis: publicadas" on public.leis for select to authenticated using (publicada);
-- decisões e sessões: só o próprio aluno. Professor e coordenação veem só contagens, pelas funções do painel.
create policy "sessoes: o próprio aluno" on public.sessoes_voto for select to authenticated using (aluno_id = (select auth.uid()));
create policy "itens: o próprio aluno" on public.itens_sessao for select to authenticated
  using (exists (select 1 from public.sessoes_voto s where s.id = sessao_id and s.aluno_id = (select auth.uid())));
create policy "decisoes: o próprio aluno" on public.decisoes for select to authenticated using (aluno_id = (select auth.uid()));
create policy "uso_diario: o próprio" on public.uso_diario for select to authenticated using (usuario_id = (select auth.uid()));
