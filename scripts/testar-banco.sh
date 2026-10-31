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

psql "$TESTE" -q -v ON_ERROR_STOP=1 \
  -f supabase/testes/00_simula_supabase.sql \
  -f supabase/migrations/20261031120000_esquema_inicial.sql \
  -f supabase/seed.sql \
  -f supabase/testes/01_testes.sql 2>&1 | grep -v "pg_cron não está ativo"
