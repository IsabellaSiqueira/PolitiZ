#!/usr/bin/env bash
# Aplica a migração e o seed num banco PostgreSQL novo e roda os testes do banco.
# Usa BANCO_URL (padrão: PostgreSQL local). O banco de teste é apagado no fim.
set -euo pipefail
cd "$(dirname "$0")/.."

URL="${BANCO_URL:-postgresql://postgres@localhost:5432/postgres}"
BANCO="politiq_teste_$$"
TESTE="${URL%/*}/$BANCO"

psql "$URL" -qc "create database $BANCO"
trap 'psql "$URL" -qc "drop database if exists $BANCO" >/dev/null' EXIT

# todas as migrações, na ordem do nome (que começa pela data)
arquivos=(-f supabase/testes/00_simula_supabase.sql)
for m in supabase/migrations/*.sql; do arquivos+=(-f "$m"); done
arquivos+=(-f supabase/seed.sql)
for t in supabase/testes/[0-9][0-9]_*.sql; do [ "$t" = supabase/testes/00_simula_supabase.sql ] || arquivos+=(-f "$t"); done

psql "$TESTE" -q -v ON_ERROR_STOP=1 "${arquivos[@]}" 2>&1 | grep -v "pg_cron não está ativo"
