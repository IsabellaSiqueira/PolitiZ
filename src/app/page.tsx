"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { modulo, type Aula } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone, type Nome } from "@/components/icones";
import { BotaoPrincipal, Cabecalho, Cartao, Etiqueta, FotoRasgada, Tela, Titulo } from "@/components/ui";
import fotoCongresso from "@/assets/fotos/congresso-nacional.jpg";

const temas: { nome: string; icone: Nome; href?: string }[] = [
  { nome: "Política", icone: "politica", href: "/trilhas" },
  { nome: "Economia", icone: "economia" },
  { nome: "Sociedade", icone: "sociedade" },
  { nome: "Meio ambiente", icone: "ambiente" },
];

export default function Inicio() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo titulo="Oi, " destaque="tudo bem?" apoio="Hoje é um bom dia pra entender o que tá rolando." />
        <Busca />
        <Temas />
        <CartaoDoDia />
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

/* ---------- Temas ---------- */

function Temas() {
  return (
    <section className="px-3 pt-5" aria-labelledby="temas-titulo">
      <h2 id="temas-titulo" className="sr-only">
        Temas
      </h2>
      <ul className="grid grid-cols-4">
        {temas.map((t) => {
          const conteudo = (
            <>
              <span
                className={`flex size-14 items-center justify-center rounded-full border border-linha ${t.href ? "text-tinta" : "text-suave"}`}
              >
                <Icone nome={t.icone} tamanho={22} />
              </span>
              <span className={`text-center text-xs leading-tight font-medium ${t.href ? "" : "text-suave"}`}>{t.nome}</span>
              {!t.href && <span className="text-[11px] leading-none text-suave">em breve</span>}
            </>
          );
          return (
            <li key={t.nome}>
              {t.href ? (
                <Link href={t.href} className="flex min-h-[96px] flex-col items-center gap-1.5 rounded-xl py-1 active:bg-claro">
                  {conteudo}
                </Link>
              ) : (
                <div className="flex min-h-[96px] flex-col items-center gap-1.5 py-1">{conteudo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Quiz do dia (ou a primeira aula, para quem está começando) ---------- */

/** Dia de hoje no horário de Brasília, contado desde 1970: muda o quiz à meia-noite. */
function diaDeHoje() {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return Math.floor(Date.parse(ymd) / 86_400_000);
}

function CartaoDoDia() {
  const { aulasConcluidas, aulaLiberada, carregado } = useProgresso();
  const concluidas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id));

  // o quiz só abre depois da leitura: o quiz do dia sai das aulas já concluídas
  if (carregado && concluidas.length) {
    const aula = concluidas[diaDeHoje() % concluidas.length];
    return (
      <Destaque
        etiqueta="Quiz do dia"
        titulo={aula.perguntas[0].enunciado}
        texto={`${aula.perguntas.length} perguntas sobre ${aula.titulo.toLowerCase()}. Teste o que você sabe.`}
        acao="Jogar agora"
        href={`/quiz/${aula.id}`}
      />
    );
  }

  const primeira: Aula = modulo.aulas.find((a) => !aulasConcluidas.includes(a.id) && aulaLiberada(a.numero)) ?? modulo.aulas[0];
  return (
    <Destaque
      etiqueta="Para começar"
      titulo={primeira.titulo}
      texto={`${primeira.resumo}. Leia a aula e depois faça o quiz.`}
      acao="Ler a aula"
      href={`/aula/${primeira.id}`}
    />
  );
}

function Destaque({ etiqueta, titulo, texto, acao, href }: { etiqueta: string; titulo: string; texto: string; acao: string; href: string }) {
  return (
    <section className="px-5 pt-4" aria-label={etiqueta}>
      <Cartao className="px-2 pt-2 pb-4">
        <FotoRasgada
          src={fotoCongresso}
          alt="Prédio do Congresso Nacional, em Brasília, refletido no espelho d'água"
          className="h-32"
          semente={5}
          posicao="center 45%"
        >
          <Etiqueta className="absolute -bottom-2 left-2">{etiqueta}</Etiqueta>
        </FotoRasgada>
        <div className="px-2">
          <h2 className="mt-5 text-[21px] leading-[1.22] font-extrabold tracking-[-0.02em]">{titulo}</h2>
          <p className="mt-1.5 text-sm leading-[1.4] text-suave">{texto}</p>
          <BotaoPrincipal href={href} className="mt-4 w-full">
            {acao}
            <Icone nome="seta" tamanho={18} />
          </BotaoPrincipal>
        </div>
      </Cartao>
    </section>
  );
}
