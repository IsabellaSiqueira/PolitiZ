"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoPrincipal, BotaoSecundario, Cabecalho, Cartao, Etiqueta, FotoRasgada, LinkTexto, Peca, Regua, Tela, Titulo } from "@/components/ui";
import fotoCongresso from "@/assets/fotos/congresso-nacional.jpg";

export default function Inicio() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo titulo="Oi, " destaque="tudo bem?" apoio="Hoje é um bom dia pra entender o que tá rolando." />
        <Busca />
        <Continuar />
        <QuizDoDia />
      </main>
    </Tela>
  );
}

/* ---------- Busca nas aulas ---------- */

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Busca() {
  const id = useId();
  const [termo, setTermo] = useState("");
  const t = normalizar(termo.trim());
  const achadas = t.length < 2 ? [] : modulo.aulas.filter((a) => normalizar([a.titulo, a.resumo, ...a.texto].join(" ")).includes(t));

  return (
    <search className="block px-5 pt-5">
      <label htmlFor={id} className="sr-only">
        Buscar temas e palavras nas aulas
      </label>
      <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-linha bg-branco px-3.5 focus-within:border-azul focus-within:shadow-[0_0_0_1px_var(--color-azul)]">
        <Icone nome="busca" tamanho={18} className="shrink-0 text-suave" />
        <input
          id={id}
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar nas aulas"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-suave focus-visible:outline-none"
        />
      </div>
      {t.length >= 2 && (
        <div aria-live="polite" className="pt-2">
          {achadas.length ? (
            <ul className="flex flex-col">
              {achadas.map((a) => (
                <li key={a.id}>
                  <Link href={`/aula/${a.id}`} className="flex min-h-11 items-center justify-between gap-3 border-b border-linha py-2 text-[15px] font-semibold">
                    <span>
                      Aula {a.numero} · {a.titulo}
                    </span>
                    <Icone nome="seta" tamanho={18} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-2 text-sm text-suave">Nenhuma aula fala de “{termo.trim()}” ainda.</p>
          )}
        </div>
      )}
    </search>
  );
}

/* ---------- Continue de onde parou ---------- */

function Continuar() {
  const { aulasConcluidas, aulaLiberada } = useProgresso();
  const total = modulo.aulas.length;
  const feitas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id)).length;
  const proxima = modulo.aulas.find((a) => !aulasConcluidas.includes(a.id) && aulaLiberada(a.numero));
  const modulo01 = `Módulo ${String(modulo.numero).padStart(2, "0")}`;

  return (
    <section className="px-5 pt-5" aria-labelledby="continuar-titulo">
      <Cartao className="pt-4 pb-4">
        <div className="flex items-center justify-between gap-3 px-4">
          <h2 id="continuar-titulo" className="t-rotulo text-suave">
            {feitas ? "Continue de onde parou" : "Comece por aqui"}
          </h2>
          <span className="text-[13px] font-semibold text-suave">
            {feitas} de {total} aulas
          </span>
        </div>
        <div className="-mx-1">
          <Regua total={total} feitos={feitas} atual={proxima ? proxima.numero - 1 : undefined} rotulo={`${feitas} de ${total} aulas concluídas`} />
        </div>
        <div className="px-4 pt-3">
          <p className="text-[13px] font-semibold text-suave">
            {modulo01} · {modulo.tema}
          </p>
          {proxima ? (
            <>
              <p className="t-subtitulo mt-1">
                Aula {proxima.numero}: {proxima.titulo}
              </p>
              <BotaoPrincipal href={`/aula/${proxima.id}`} className="mt-4 w-full">
                {feitas ? "Continuar" : "Começar a aula"}
                <Icone nome="seta" tamanho={20} />
              </BotaoPrincipal>
            </>
          ) : (
            <>
              <p className="t-subtitulo mt-1">Você concluiu o {modulo01.toLowerCase()}.</p>
              <LinkTexto href="/trilhas">Ver a trilha</LinkTexto>
            </>
          )}
        </div>
      </Cartao>
    </section>
  );
}

/* ---------- Quiz do dia (só para quem já concluiu alguma aula) ---------- */

/** Dia de hoje no horário de Brasília, contado desde 1970: muda o quiz à meia-noite. */
function diaDeHoje() {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return Math.floor(Date.parse(ymd) / 86_400_000);
}

function QuizDoDia() {
  const { aulasConcluidas, carregado } = useProgresso();
  const concluidas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id));
  // o quiz só abre depois da leitura: o quiz do dia sai das aulas já concluídas
  if (!carregado || !concluidas.length) return null;
  const aula = concluidas[diaDeHoje() % concluidas.length];

  return (
    <section className="px-5 pt-4" aria-label="Quiz do dia">
      <Cartao className="px-2 pt-2 pb-4">
        <FotoRasgada
          src={fotoCongresso}
          alt="Prédio do Congresso Nacional, em Brasília, refletido no espelho d'água"
          className="h-32"
          posicao="center 45%"
        >
          <Peca nome="papel-azul" className="-top-3 -left-2 w-24 -rotate-8" />
          <Peca nome="rabisco-azul" className="top-2 right-3 w-14" />
          <Etiqueta className="absolute -bottom-2 left-2">Quiz do dia</Etiqueta>
        </FotoRasgada>
        <div className="px-2">
          <h2 className="mt-5 text-[21px] leading-[1.22] font-extrabold tracking-[-0.02em]">{aula.perguntas[0].enunciado}</h2>
          <p className="mt-1.5 text-sm leading-[1.4] text-suave">
            {aula.perguntas.length} perguntas sobre {aula.titulo.toLowerCase()}. Teste o que você sabe.
          </p>
          {/* um único botão amarelo por tela: o principal é o "continuar" */}
          <BotaoSecundario href={`/quiz/${aula.id}`} className="mt-4 w-full">
            Jogar agora
            <Icone nome="seta" tamanho={18} />
          </BotaoSecundario>
        </div>
      </Cartao>
    </section>
  );
}
