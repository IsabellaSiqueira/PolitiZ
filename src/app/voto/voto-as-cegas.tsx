"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Autoria, LeiCartao } from "@/lib/tipos";
import { useProgresso, type Voto } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import {
  AvisoExemplo,
  BotaoPrincipal,
  BotaoSecundario,
  Cabecalho,
  Carimbo,
  Cartao,
  Etiqueta,
  LinkTexto,
  MarcaTexto,
  Regua,
  Tela,
} from "@/components/ui";

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
  const dados = revelacao?.estado === "ok" ? revelacao.dados : null;

  return (
    <Tela>
      <Cabecalho>
        <span className="text-[13px] font-semibold" aria-hidden="true">
          {posicao} de {leis.length}
        </span>
      </Cabecalho>
      <main className="flex-1 pb-32">
        <Regua
          total={leis.length}
          feitos={decididasNaSessao - (votou ? 1 : 0)}
          atual={posicao - 1}
          rotulo={`Lei ${posicao} de ${leis.length}. ${decididasNaSessao} decididas.`}
        />

        <section className="px-5 pt-5" aria-label="Projeto de lei">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {votou ? (
              <Etiqueta cor="azul">Revelado após a sua decisão</Etiqueta>
            ) : (
              <p className="t-rotulo text-azul" aria-live="polite">Julgue a ideia, não a pessoa</p>
            )}
          </div>
          <p className="mt-3 text-[13px] font-semibold text-suave">
            {[lei.rotulo, lei.tema, fonte === "camara" ? "Ementa oficial" : null].filter(Boolean).join(" · ")}
          </p>
          <h2
            ref={tituloLei}
            tabIndex={-1}
            className={`mt-2 outline-none ${ementaLonga ? "t-subtitulo" : "t-titulo"}`}
          >
            {lei.ementa}
          </h2>
          {lei.resumo && <p className="t-corpo mt-2">{lei.resumo}</p>}
        </section>

        <section className="relative px-5 pt-5" aria-label="Quem propôs">
          <Cartao className="px-5 pt-4 pb-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-suave">
              {!dados && <Icone nome="cadeado" tamanho={15} />}
              {dados ? "Agora você sabe quem propôs" : votou ? "Revelando…" : "Oculto até a sua decisão"}
            </p>
            <Campo
              rotulo="Autoria"
              larguraTarja="w-[164px]"
              valor={dados ? <MarcaTexto>{dados.autoria}</MarcaTexto> : null}
              nota={dados && dados.coautores > 0 ? `e mais ${dados.coautores} coautor${dados.coautores > 1 ? "es" : ""}` : null}
            />
            <div className="my-3 h-px bg-linha" />
            <Campo
              rotulo="Partido"
              larguraTarja="w-[54px]"
              valor={dados ? (dados.partido ?? "Sem partido") : null}
              nota={dados ? (fonte === "camara" ? "Partido atual do autor · fonte: Câmara dos Deputados" : "Exemplo ilustrativo") : null}
            />
            {revelacao?.estado === "erro" && (
              <p className="mt-3 text-sm" role="alert">
                Não deu pra consultar a autoria agora.{" "}
                <button type="button" onClick={() => revelar(lei.id)} className="min-h-11 font-bold text-azul underline underline-offset-4">
                  Tentar de novo
                </button>
              </p>
            )}
            {!votou && fonte === "exemplo" && (
              <div className="mt-3">
                <AvisoExemplo />
              </div>
            )}
          </Cartao>

          {voto && <Carimbo voto={voto} className="absolute -top-1 right-3" />}
        </section>

        <div className="px-5 pt-5">
          {!votou ? (
            <>
              <div role="group" aria-label="Sua decisão sobre a ideia" className="grid grid-cols-2 gap-3">
                <BotaoSecundario onClick={() => decidir("rejeito")}>
                  <Icone nome="errado" tamanho={20} />
                  Rejeito
                </BotaoSecundario>
                <BotaoSecundario onClick={() => decidir("aprovo")}>
                  <Icone nome="certo" tamanho={20} />
                  Aprovo
                </BotaoSecundario>
              </div>
              <div className="flex flex-col items-center pt-2">
                <LinkTexto onClick={pularLei}>Pular esta lei</LinkTexto>
                <p className="text-center text-[13px] text-suave">Pular não conta. A lei volta no fim da sessão.</p>
              </div>
              <div className="flex justify-center pt-1">
                <LinkTexto href="/criterio" azul>
                  Como as leis são escolhidas
                </LinkTexto>
              </div>
            </>
          ) : (
            <>
              <p className="text-[15px] leading-[1.4] font-bold">
                Saber quem propôs é só o começo. Leia o que a lei muda antes de pensar de novo.
              </p>
              {dados?.link && (
                <div className="pt-2">
                  <LinkTexto href={dados.link} azul externo>
                    Ler o texto oficial na Câmara
                  </LinkTexto>
                </div>
              )}
              <BotaoPrincipal id="proxima-lei" onClick={proxima} className="mt-5 w-full">
                {fila.length ? "Próxima lei" : "Fechar a sessão"}
                <Icone nome="seta" tamanho={20} />
              </BotaoPrincipal>
            </>
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
        <div className="px-5 pt-4">
          <p className="t-rotulo text-azul">Sessão concluída</p>
          <h1 className="t-display mt-3">
            Você decidiu <MarcaTexto>{total} leis</MarcaTexto>
          </h1>
          <p className="t-corpo mt-3 max-w-[36ch] text-suave">
            {fonte === "camara"
              ? "Você julgou todas as leis desta sessão. Leis decididas não voltam: uma nova sessão aparece quando a Câmara apresentar novos projetos."
              : "Você julgou todas as leis de exemplo desta sessão. Leis decididas não voltam."}
          </p>
        </div>
        <div className="px-5 pt-8">
          <BotaoPrincipal href="/" className="w-full">
            Voltar pra trilha
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
          <div className="flex justify-center pt-2">
            <LinkTexto href="/criterio" azul>
              Como as leis são escolhidas
            </LinkTexto>
          </div>
        </div>
      </main>
    </Tela>
  );
}

function Campo({
  rotulo,
  valor,
  larguraTarja,
  nota = null,
}: {
  rotulo: string;
  valor: React.ReactNode | null;
  larguraTarja: string;
  nota?: string | null;
}) {
  return (
    <div className="mt-3 flex flex-col items-start gap-1">
      <span className="t-rotulo text-suave">{rotulo}</span>
      <span className="relative inline-flex min-h-7 min-w-0 items-center">
        {valor ? (
          <>
            <span className="anim-revela text-[22px] leading-tight font-extrabold tracking-[-0.02em]">{valor}</span>
            <span aria-hidden="true" className={`anim-tarja absolute inset-y-0 left-0 bg-tinta ${larguraTarja}`} />
          </>
        ) : (
          <span className={`block h-6 rounded-[3px] bg-tinta ${larguraTarja}`}>
            <span className="sr-only">oculto até a sua decisão</span>
          </span>
        )}
      </span>
      {nota && <span className="anim-revela text-[13px] text-suave">{nota}</span>}
    </div>
  );
}
