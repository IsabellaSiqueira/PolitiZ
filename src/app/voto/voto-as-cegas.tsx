"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Autoria, LeiCartao } from "@/lib/tipos";
import { useProgresso, type Voto } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { AvisoExemplo, BotaoAcao, Cabecalho, Janela, LinkSecundario, Manchete, Regua, Selo, Tela } from "@/components/ui";

type Revelacao = { estado: "buscando" } | { estado: "ok"; dados: Autoria } | { estado: "erro" };

/**
 * Sessão do Voto às Cegas.
 * - Pular não conta: a lei vai pro fim da fila e pode voltar.
 * - Lei decidida não volta.
 * - O voto (aprovo/rejeito) só existe nesta tela, na memória, para mostrar o selo.
 *   Ele nunca é salvo, nem enviado ao servidor: a rota de autoria recebe só o id da lei.
 */
export default function VotoAsCegas({ leis, fonte }: { leis: LeiCartao[]; fonte: "camara" | "exemplo" }) {
  const { decididas, puladas, registrarDecisao, pular, carregado } = useProgresso();

  const fila = useMemo(() => {
    const pendentes = leis.filter((l) => !decididas.includes(l.id));
    const naoPuladas = pendentes.filter((l) => !puladas.includes(l.id));
    const voltando = puladas.map((id) => pendentes.find((l) => l.id === id)).filter((l): l is LeiCartao => !!l);
    return [...naoPuladas, ...voltando];
  }, [leis, decididas, puladas]);

  const decididasNaSessao = leis.filter((l) => decididas.includes(l.id)).length;

  // a lei que está na tela: fica fixa durante a revelação, mesmo depois de entrar em "decididas"
  const [mostrada, setMostrada] = useState<string | null>(null);
  const [voto, setVoto] = useState<Voto | null>(null);
  const [revelacao, setRevelacao] = useState<Revelacao | null>(null);
  const [trocou, setTrocou] = useState(0);
  const tituloLei = useRef<HTMLHeadingElement>(null);

  const lei = leis.find((l) => l.id === (mostrada ?? fila[0]?.id)) ?? null;

  useEffect(() => {
    // nova lei na tela: leva o foco pro título dela (não na primeira carga)
    if (trocou > 0) tituloLei.current?.focus();
  }, [trocou]);

  const revelar = async (id: string) => {
    setRevelacao({ estado: "buscando" });
    try {
      const r = await fetch(`/api/autoria/${encodeURIComponent(id)}`);
      if (!r.ok) throw new Error(String(r.status));
      setRevelacao({ estado: "ok", dados: (await r.json()) as Autoria });
    } catch {
      setRevelacao({ estado: "erro" });
    }
  };

  const decidir = (v: Voto) => {
    if (!lei) return;
    setMostrada(lei.id);
    setVoto(v);
    registrarDecisao(lei.id);
    void revelar(lei.id);
    // os botões de voto saem da tela: o foco segue pra próxima ação
    requestAnimationFrame(() => document.getElementById("proxima-lei")?.focus());
  };

  const proxima = () => {
    setMostrada(null);
    setVoto(null);
    setRevelacao(null);
    setTrocou((n) => n + 1);
  };

  const pularLei = () => {
    if (!lei) return;
    pular(lei.id);
    setTrocou((n) => n + 1);
  };

  const votou = voto !== null;
  const posicao = votou ? decididasNaSessao : Math.min(decididasNaSessao + 1, leis.length);

  if (carregado && !lei) return <SessaoConcluida total={leis.length} fonte={fonte} />;
  if (!lei) return null;

  const ementaLonga = lei.ementa.length > 110;

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete
          sobretitulo={votou ? "Agora você sabe quem propôs" : "Julgue a ideia, não a pessoa"}
          linha1="Voto às"
          linha2="Cegas"
          numeral={String(posicao).padStart(2, "0")}
          numeralRotulo={`de ${leis.length}`}
        />
        <Regua
          total={leis.length}
          feitos={decididasNaSessao - (votou ? 1 : 0)}
          atual={posicao - 1}
          rotulo={`Lei ${posicao} de ${leis.length}. ${decididasNaSessao} decididas.`}
        />
        <p className="px-5 pt-1">
          <Link
            href="/criterio"
            className="inline-flex min-h-11 items-center font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-papel underline underline-offset-4"
          >
            Como as leis são escolhidas
          </Link>
        </p>

        <section className="relative px-5" aria-label="Projeto de lei">
          <Janela rotulo={lei.rotulo} etiqueta={lei.tema ?? undefined} pilha>
            <div className="flex flex-col gap-3 px-5 pt-[18px] pr-[22px] pb-[18px]">
              {fonte === "camara" && (
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">Ementa oficial</p>
              )}
              <h2
                ref={tituloLei}
                tabIndex={-1}
                className={`outline-none ${
                  ementaLonga ? "text-[17px] leading-[1.42] font-semibold" : "text-[27px] leading-none font-black tracking-[-0.025em]"
                }`}
              >
                {lei.ementa}
              </h2>
              {lei.resumo && <p className="text-[15px] leading-[1.47]">{lei.resumo}</p>}
            </div>

            <div className="perfuracao flex flex-col gap-2 px-5 pt-3 pb-3.5">
              <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">
                <Icone nome={revelacao?.estado === "ok" ? "olho" : "cadeado"} tamanho={14} />
                {revelacao?.estado === "ok" ? "Revelado após a sua decisão" : votou ? "Revelando…" : "Oculto até a sua decisão"}
              </p>
              <Campo
                rotulo="Autoria"
                larguraTarja="w-[164px]"
                valor={revelacao?.estado === "ok" ? revelacao.dados.autoria : null}
                nota={
                  revelacao?.estado === "ok" && revelacao.dados.coautores > 0
                    ? `e mais ${revelacao.dados.coautores} coautor${revelacao.dados.coautores > 1 ? "es" : ""}`
                    : null
                }
              />
              <Campo
                rotulo="Partido"
                larguraTarja="w-[54px]"
                valor={revelacao?.estado === "ok" ? (revelacao.dados.partido ?? "Sem partido") : null}
              />
              {revelacao?.estado === "erro" && (
                <p className="text-sm" role="alert">
                  Não deu pra consultar a autoria agora.{" "}
                  <button type="button" onClick={() => revelar(lei.id)} className="min-h-11 font-bold underline underline-offset-4">
                    Tentar de novo
                  </button>
                </p>
              )}
              <div className={votou ? "pr-24" : ""}>
                <Rodape fonte={fonte} revelacao={revelacao} />
              </div>
            </div>
          </Janela>

          {voto && <Selo voto={voto} className="absolute right-5 -bottom-11" />}
        </section>

        <div className="px-5 pt-5">
          {!votou ? (
            <>
              <div role="group" aria-label="Sua decisão sobre a ideia" className="btn-acao flex h-[60px] overflow-hidden rounded-[4px] bg-amarelo">
                <BotaoVoto onClick={() => decidir("rejeito")} icone="errado" className="border-r-[2.5px] border-tinta">
                  Rejeito
                </BotaoVoto>
                <BotaoVoto onClick={() => decidir("aprovo")} icone="certo">
                  Aprovo
                </BotaoVoto>
              </div>
              <div className="pt-1.5">
                <LinkSecundario onClick={pularLei}>Pular esta lei</LinkSecundario>
              </div>
              <p className="text-center text-xs font-semibold text-papel">Pular não conta. A lei volta no fim da sessão.</p>
            </>
          ) : (
            <BotaoAcao id="proxima-lei" onClick={proxima} className="mt-[34px] w-full">
              {fila.length ? "Próxima lei" : "Fechar a sessão"}
              <Icone nome="seta" />
            </BotaoAcao>
          )}
        </div>
      </main>
    </Tela>
  );
}

function SessaoConcluida({ total, fonte }: { total: number; fonte: "camara" | "exemplo" }) {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete sobretitulo="Sessão concluída" linha1="Você" linha2="decidiu" numeral={String(total)} numeralRotulo="leis" tamanho="media" />
        <p className="max-w-[36ch] px-5 pt-4 text-[15px] leading-[1.45] font-semibold text-papel">
          {fonte === "camara"
            ? "Você julgou todas as leis desta sessão. Leis decididas não voltam: uma nova sessão aparece quando a Câmara apresentar novos projetos."
            : "Você julgou todas as leis de exemplo desta sessão. Leis decididas não voltam."}
        </p>
        <div className="px-5 pt-6">
          <BotaoAcao href="/" className="w-full">
            Voltar pra trilha
            <Icone nome="seta" />
          </BotaoAcao>
          <div className="pt-1.5">
            <LinkSecundario href="/criterio">Como as leis são escolhidas</LinkSecundario>
          </div>
        </div>
      </main>
    </Tela>
  );
}

function Rodape({ fonte, revelacao }: { fonte: "camara" | "exemplo"; revelacao: Revelacao | null }) {
  if (fonte === "exemplo") return <AvisoExemplo />;
  const dados = revelacao?.estado === "ok" ? revelacao.dados : null;
  return (
    <p className="font-mono text-[11px] font-medium uppercase leading-relaxed tracking-[0.04em] text-tinta-suave">
      Fonte: Câmara dos Deputados
      {dados?.partido && " · partido atual do autor"}
      {dados?.link && (
        <>
          {" · "}
          <a
            href={dados.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-semibold text-tinta underline underline-offset-4"
          >
            Texto oficial
          </a>
        </>
      )}
    </p>
  );
}

function Campo({
  rotulo,
  valor,
  larguraTarja,
  nota = null,
}: {
  rotulo: string;
  valor: string | null;
  larguraTarja: string;
  nota?: string | null;
}) {
  return (
    <div className="flex min-h-7 items-start gap-3">
      <span className="w-[68px] shrink-0 pt-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-tinta-suave">{rotulo}</span>
      <span className="flex min-w-0 flex-col items-start gap-1">
        <span className="relative inline-flex min-w-0 items-center">
          {valor ? (
            <>
              <span className="anim-revela bg-rosa px-1.5 py-px text-lg leading-tight font-black tracking-[-0.01em] [box-decoration-break:clone]">
                {valor}
              </span>
              <span aria-hidden="true" className={`anim-tarja absolute inset-y-0 left-0 bg-tinta ${larguraTarja}`} />
            </>
          ) : (
            <span className={`block h-6 bg-tinta ${larguraTarja}`}>
              <span className="sr-only">oculto até a sua decisão</span>
            </span>
          )}
        </span>
        {nota && <span className="anim-revela font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">{nota}</span>}
      </span>
    </div>
  );
}

function BotaoVoto({
  children,
  icone,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  icone: "certo" | "errado";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 text-[17px] font-black uppercase tracking-[0.03em] transition-colors duration-100 active:bg-tinta active:text-papel ${className}`}
    >
      <Icone nome={icone} tamanho={20} />
      {children}
    </button>
  );
}
