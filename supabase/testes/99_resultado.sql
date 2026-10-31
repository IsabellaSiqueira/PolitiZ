-- Resultado de todos os arquivos de teste. Roda sempre por último.
-- ---------------------------------------------------------------------
-- Resultado
-- ---------------------------------------------------------------------
\o
select format('%s %s%s', case when passou then '  ok  ' else 'FALHOU' end, nome, case when not passou then '  (' || coalesce(detalhe, '') || ')' else '' end)
from teste.resultados order by n;
select format(E'\n%s testes, %s falharam', count(*), count(*) filter (where not passou)) from teste.resultados;
do $$ begin if exists (select 1 from teste.resultados where not passou) then raise exception 'há testes falhando'; end if; end $$;
