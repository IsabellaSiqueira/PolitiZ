"use client";

import { useEffect, useRef, useState } from "react";
import type { Autoria, LeiCartao } from "@/lib/tipos";
import { useProgresso, type Voto } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { AvisoExemplo, BotaoAcao, Cabecalho, Janela, LinkSecundario, Manchete, Regua, Selo, Tela } from "@/components/ui";

type Revelacao = { estado: "buscando" } | { estado: "ok"; dados: Autoria } | { estado: "erro" };

export default function VotoAsCegas({ leis, fonte }: { leis: LeiCartao[]; fonte: "camara" | "exemplo" }) {
  const { leiAtual, votos, votar, proximaLei } = useProgresso();
  const indice = leiAtual % leis.length;
  const lei = leis[indice];
  const [decidido, setDecidido] = useState<Voto | null>(null);
  const [revelacao, setRevelacao] = useState<Revelacao | null>(null);
  const tituloLei = useRef<HTMLHeadingElement>(null);
  const primeiraLei = useRef(true);

  useEffect(() => {
    // mudou de lei: volta ao estado cego e leva o foco pro título da nova lei
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecidido(null);
    setRevelacao(null);
    if (primeiraLei.current) {
      primeiraLei.current = false;
      return;
    }
    tituloLei.current?.focus();
  }, [indice]);

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
    votar(lei.id, v, lei.tema);
    setDecidido(v);
    void revelar(lei.id);
    // os botões de voto saem da tela: o foco segue pra próxima ação
    requestAnimationFrame(() => document.getElementById("proxima-lei")?.focus());
  };

  const avancar = () => proximaLei(leis.length);

  const votou = decidido !== null;
  const jaVotadas = leis.filter((l) => votos[l.id]).length;
  const ementaLonga = lei.ementa.length > 110;

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete
          sobretitulo={votou ? "Agora você sabe quem propôs" : "Julgue a ideia, não a pessoa"}
          linha1="Voto às"
          linha2="Cegas"
          numeral={String(indice + 1).padStart(2, "0")}
          numeralRotulo={`de ${leis.length}`}
        />
        <Regua
          total={leis.length}
          feitos={indice}
          atual={indice}
          rotulo={`Lei ${indice + 1} de ${leis.length}. Você já votou em ${jaVotadas}.`}
        />

        <section className="relative px-5 pt-[18px]" aria-label="Projeto de lei">
          <Janela rotulo={lei.rotulo} etiqueta={lei.tema ?? undefined} pilha>
            <div className="flex flex-col gap-3 px-5 pt-[18px] pr-[22px] pb-[18px]">
              {fonte === "camara" && (
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">Ementa oficial</p>
              )}
              <h2
                ref={tituloLei}
                tabIndex={-1}
                className={`outline-none ${
                  ementaLonga
                    ? "text-[17px] leading-[1.42] font-semibold"
                    : "text-[27px] leading-none font-black tracking-[-0.025em]"
                }`}
              >
                {lei.ementa}
              </h2>
              {lei.resumo && <p className="text-[15px] leading-[1.47]">{lei.resumo}</p>}
            </div>

            <div className="perfuracao flex flex-col gap-2 px-5 pt-3 pb-3.5">
              <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">
                <Icone nome={revelacao?.estado === "ok" ? "olho" : "cadeado"} tamanho={14} />
                {revelacao?.estado === "ok" ? "Revelado após o seu voto" : votou ? "Revelando…" : "Oculto até o seu voto"}
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
                  Não deu pra consultar a Câmara agora.{" "}
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

          {decidido && <Selo voto={decidido} className="absolute right-5 -bottom-11" />}
        </section>

        <div className="px-5 pt-5">
          {!votou ? (
            <>
              <div role="group" aria-label="Seu voto sobre a ideia" className="btn-acao flex h-[60px] overflow-hidden rounded-[4px] bg-amarelo">
                <BotaoVoto onClick={() => decidir("rejeito")} icone="errado" className="border-r-[2.5px] border-tinta">
                  Rejeito
                </BotaoVoto>
                <BotaoVoto onClick={() => decidir("aprovo")} icone="certo">
                  Aprovo
                </BotaoVoto>
              </div>
              <div className="pt-1.5">
                <LinkSecundario onClick={avancar}>Pular esta lei</LinkSecundario>
              </div>
            </>
          ) : (
            <>
              <BotaoAcao id="proxima-lei" onClick={avancar} className="mt-[34px] w-full">
                Próxima lei
                <Icone nome="seta" />
              </BotaoAcao>
              <div className="pt-1.5">
                <LinkSecundario href="/perfil">Ver meu perfil de prioridades</LinkSecundario>
              </div>
            </>
          )}
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
          <a href={dados.link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-semibold text-tinta underline underline-offset-4">
            Ficha oficial
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
            <span className="sr-only">oculto até o seu voto</span>
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
