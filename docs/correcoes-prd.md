# Correções para o PRD e o Tech Brief

Contradições dentro do **PRD MVP v1.5** e do **Tech Brief v1.6**, para a Isa corrigir nos documentos (decisão D12, 31/10/2026). O app não muda por causa delas. Ao corrigir, vale o que já foi decidido na D12 (`docs/divergencias-prd.md`); a coluna "Como fica" diz qual dos dois lados prevalece.

| Código | Contradição | Como fica |
| --- | --- | --- |
| **W1** | Sessão "entre 5 e 10 cartões" (CA-03.6) e "sempre 7 cartões" (4.3, CA-03.8b, Tech Brief 3.5) | Nenhum dos dois: 15 leis por sessão (Y9) |
| **W2** | "Sem conexão: cache local, sincroniza depois" (2.3) e "modo offline não suportado" (4.1, Tech Brief 1) | Sem modo offline (Y13); o app mostra a tela "Sem internet" (B5) |
| **W3** | Histórico de votos salvo no perfil (CA-03.8) e sentido do voto nunca armazenado (4.2, 5.5) | O voto nunca é armazenado (X2) |
| **W4** | Glossário "não é etapa da timeline" (1.2, 2.1) e glossário na posição 1 que destrava o próximo item (2.2, CA-01.2, `module_timeline`) | O glossário é só referência, fora da sequência (Y6) |
| **W5** | Foto de perfil por avatar com iniciais, sem upload (4.1) e "Supabase Storage para as fotos de perfil" (anotação no Tech Brief 1) | Avatar com iniciais, sem upload (o protótipo F10 mostra "Trocar foto", que fica fora do MVP) |
| **W6** | Tabelas `user_timeline_progress` e `pls` (PRD) e `user_quiz_progress`, `user_glossary_progress` e `cards` (Tech Brief) | Vale o esquema que existe em `supabase/` |
| **W7** | Partido do autor (`author_party`, PRD) e "categoria do autor" (`author_category`, Tech Brief) | Partido atual do autor |
| **W8** | Etapas "A, B e C" (2.3, CA-03.1) sem definição de A e B depois que a jornada virou timeline de quizzes | Trilha de aulas com quiz e o Voto às Cegas sempre disponível |
| **W9** | Hospedagem "Vercel ou Netlify" e a anotação "render" no Tech Brief 1 | Vercel |
