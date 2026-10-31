# Proposta · Critério de seleção das leis do Voto às Cegas

Proposta para a decisão D1b do `docs/plano-mvp.md`. Nada aqui está decidido: os pontos em aberto estão no fim. Quando a Isa aprovar, o texto da seção 8 vai para a página pública `/criterio`.

## 1. O que o critério precisa garantir

O Voto às Cegas só funciona se o aluno confiar que o politiQ não escolhe as leis para empurrar uma opinião. Por isso o critério precisa ser:

1. **Público:** qualquer pessoa consegue ler como as leis são escolhidas.
2. **Equilibrado:** nenhum partido, região ou tema domina, e pela lista não dá para adivinhar de que lado vem cada lei.
3. **Pouco dependente de gosto pessoal:** a equipe aplica regras e sorteia, em vez de escolher uma por uma.
4. **Verificável:** dá para conferir depois se as regras foram seguidas.
5. **Bom para aprender:** leis que um estudante do Ensino Médio consegue entender e julgar pela ideia.

## 2. De onde vêm as leis

- **Tipo:** projetos de lei (PL) da Câmara dos Deputados e do Senado Federal. Ficam de fora, no MVP, propostas de emenda à Constituição (PEC), medidas provisórias e decretos, que têm regras próprias e exigiriam mais explicação.
- **Período:** apresentados nos últimos 24 meses.
- **Situação:** em tramitação, ou seja, ainda em discussão. Projetos já arquivados não entram.
- **Fonte dos dados:** os dados abertos oficiais da Câmara e do Senado, de onde também vêm o autor, os coautores e o link para o texto oficial.

## 3. O que não entra

Um projeto fica de fora se:

1. **Só homenageia:** dá nome a rodovia, prédio ou viaduto, cria data comemorativa ou título honorífico.
2. **Revela o autor no próprio texto:** por exemplo, cita o nome de quem propôs, de um partido ou de um governo específico. Isso quebraria o "às cegas".
3. **Não cabe num resumo curto:** se não dá para explicar o que muda em até 60 palavras sem perder o essencial.
4. **Repete outro projeto da lista:** quando vários projetos tratam da mesma coisa (os chamados apensados), entra só um, sorteado.
5. **Trata de um caso individual:** pensão para uma pessoa, liberação de um terreno específico e assuntos parecidos.
6. **Não é adequado à faixa etária:** a equipe pedagógica marca o motivo por escrito. Este filtro é o mais subjetivo, e por isso cada uso fica registrado (ver seção 5).

## 4. Equilíbrio em cada lote de 15 leis

As leis entram em lotes de 15, o tamanho de uma sessão. Cada lote respeita estas cotas:

| Regra | Limite |
| --- | --- |
| Mesmo partido do autor principal | no máximo 2 leis |
| Partidos diferentes | pelo menos 8 |
| Casa legislativa | pelo menos 4 do Senado e 4 da Câmara |
| Regiões do país (pela UF do autor) | pelo menos 4 das 5 regiões |
| Mesmo tema | no máximo 3 leis |
| Temas diferentes | pelo menos 5 |
| Ligadas à vida do estudante (escola, transporte, trabalho, internet, saúde do jovem) | pelo menos 5 |

Os temas seguem a classificação oficial da Câmara (Educação, Saúde, Trabalho e Emprego, Meio Ambiente, Segurança, Economia, Cultura, Direitos Humanos e outros), para não depender de uma classificação própria. O Senado classifica os assuntos de outro jeito: para os projetos dele, a equipe usa o tema equivalente da lista da Câmara.

**Por que cotas por partido e não por "lado":** o combinado 05 do manual diz "pessoas, não lados". Dividir em esquerda e direita exigiria classificar partidos, o que já é uma opinião. Limitar a 2 por partido e exigir pelo menos 8 partidos espalha os autores sem rotular ninguém.

## 5. Como um lote é montado

1. **Lista de candidatos (automática):** um script busca nos dados abertos os PLs que cumprem a seção 2.
2. **Filtros (equipe):** duas pessoas aplicam a seção 3. Cada exclusão fica registrada com o número do projeto e o motivo.
3. **Sorteio:** entre os candidatos que sobraram, um sorteio monta o lote respeitando as cotas da seção 4. A semente é o resultado do primeiro concurso da Mega-Sena depois da publicação da lista (decidido em 31/10/2026): ninguém da equipe controla, e qualquer pessoa consegue refazer o sorteio e chegar ao mesmo resultado.
4. **Resumo:** uma pessoa escreve o resumo de cada lei e outra revisa, seguindo a lista da seção 6.
5. **Publicação:** o lote entra no banco e o registro do lote (candidatos, exclusões com motivo, semente e lista final) fica disponível para quem pedir, e para as escolas.

## 6. Como escrever o resumo

Cada resumo:

- [ ] diz **o que muda** e **para quem**, em até 60 palavras;
- [ ] é fiel ao texto do projeto, sem acrescentar efeitos que o texto não promete;
- [ ] não usa adjetivos de valor ("importante", "absurdo", "polêmico") nem palavras que entreguem um lado;
- [ ] não cita pessoa, partido nem governo;
- [ ] explica todo termo técnico na primeira vez que aparece;
- [ ] tem frases de até 20 palavras e números em algarismos (manual, voz e tom);
- [ ] quando o projeto diz de onde sai o dinheiro, o resumo diz também.

A ementa oficial continua aparecendo como apoio, e o link leva ao texto completo.

**Correções:** a página `/criterio` tem um contato para avisar de resumo errado ou tendencioso. A equipe responde em até 7 dias e, se corrigir, registra a mudança (a auditoria do banco já guarda o antes e o depois).

## 7. Ritmo e quantidade no piloto

Cada sessão tem 15 leis, e uma lei decidida não volta para o aluno. Proposta para um piloto de 6 semanas:

- **Início:** 3 lotes no ar (45 leis), para a turma ter material nas primeiras aulas.
- **Depois:** 1 lote novo a cada 2 semanas (mais 45 até o fim do piloto, 90 no total).
- **Usuário gratuito:** com 5 decisões por dia, consome um lote em 3 dias, então sempre vai ter lei nova.

O partido mostrado é o **atual** do autor, e a tela avisa que pode ser diferente do partido que ele tinha quando apresentou o projeto. Essa regra continua igual.

## 8. Texto para a página pública `/criterio` (rascunho)

> **Como as leis são escolhidas**
>
> No Voto às Cegas você julga projetos de lei de verdade. Projeto de lei é uma proposta de lei nova, ou de mudança numa lei que já existe, que ainda está em discussão no Congresso.
>
> **De onde vêm.** Os projetos são da Câmara dos Deputados e do Senado, apresentados nos últimos 2 anos e ainda em discussão. Os dados são os que as duas Casas publicam.
>
> **O que fica de fora.** Projetos que só dão nome a ruas ou criam datas comemorativas, que citam o nome de quem propôs, que tratam do caso de uma pessoa só ou que repetem outro projeto da lista.
>
> **Como mantemos o equilíbrio.** As leis entram em grupos de 15. Em cada grupo, nenhum partido tem mais de 2 leis, aparecem pelo menos 8 partidos, pelo menos 4 regiões do país e pelo menos 5 temas diferentes.
>
> **Quem escolhe.** Ninguém escolhe lei por lei. Primeiro publicamos a lista de projetos que podem entrar. Depois, um sorteio monta cada grupo seguindo essas regras, usando como ponto de partida os números do concurso seguinte da Mega-Sena. Assim ninguém da equipe controla o resultado, e qualquer pessoa pode refazer o sorteio e conferir.
>
> **O resumo.** A equipe do politiQ escreve um resumo curto de cada projeto: o que muda e para quem, sem opinião. Outra pessoa revisa. A ementa oficial e o link para o texto completo aparecem logo abaixo.
>
> **O que fica escondido.** Autor e partido só aparecem depois da sua decisão. O partido mostrado é o atual do autor e pode ser diferente do que ele tinha quando apresentou o projeto.
>
> **O que o politiQ guarda.** Só que você decidiu sobre aquela lei, para ela não voltar. Se você aprovou ou rejeitou nunca é gravado, em lugar nenhum.
>
> **Achou um resumo errado ou tendencioso?** Escreva para [contato]. Respondemos em até 7 dias.

## 9. Pontos para a Isa decidir

1. **PEC e medidas provisórias:** ficam de fora do MVP, como proposto, ou entram?
2. **Só em tramitação, ou também projetos que já viraram lei?** Projetos aprovados mostram o resultado real, mas o aluno pode já conhecer o tema e o autor.
3. **Cotas:** os números da seção 4 servem? O mais sensível é o limite de 2 por partido.
4. **Filtro de faixa etária (item 6 da seção 3):** quem da equipe pedagógica decide, e se a escola pode pedir para tirar algum tema.
5. **Sorteio com semente pública:** vale a complexidade? A alternativa é a equipe escolher dentro das cotas, o que é mais simples mas menos verificável.
6. **Ritmo do piloto:** 45 leis no início e 15 a cada 2 semanas está bom para a equipe escrever os resumos?
7. **Contato para correções:** qual e-mail ou formulário.
8. **Registro dos lotes:** fica público na página, ou só disponível a pedido e para as escolas?

Se o sorteio for aprovado, um script pequeno faz a busca nos dados abertos, aplica as cotas e gera o lote com a semente. Ele entra no plano como item novo.
