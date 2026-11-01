"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Autoria, Contexto, LeiCartao, OpcaoTrc } from "@/lib/tipos";
import { dados as fonteDeDados } from "@/lib/dados";
import { TextoComTermos } from "@/components/glossario";
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
  // depois da revelação, a tela D9 "Contexto da lei"
  const [noContexto, setNoContexto] = useState(false);
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
    setNoContexto(false);
    setTrocou((n) => n + 1);
  };

  const pularLei = () => {
    if (!lei) return;
    pular(lei.id);
    setTrocou((n) => n + 1);
  };

  const votou = voto !== null;
  const posicao = votou ? decididasNaSessao : Math.min(decididasNaSessao + 1, leis.length);
  // Y7: deslizar é só um atalho dos botões, igual para os dois lados
  const deslizar = useDeslizar((lado) => decidir(lado === "direita" ? "aprovo" : "rejeito"), !votou && !!lei);

  if (carregado && !lei) return <SessaoConcluida total={leis.length} fonte={fonte} />;
  if (!lei) return null;

  const ementaLonga = lei.ementa.length > 110;
  const dados = revelacao?.estado === "ok" ? revelacao.dados : null;

  if (noContexto && dados?.contexto) {
    return (
      <ContextoDaLei
        lei={lei}
        contexto={dados.contexto}
        fonte={fonte}
        posicao={posicao}
        total={leis.length}
        ultima={!fila.length}
        proxima={proxima}
      />
    );
  }

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

        <section
          className="px-5 pt-5"
          aria-label="Projeto de lei"
          {...deslizar.props}
        >
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
          {lei.resumo && (
            <p className="t-corpo mt-2">
              <TextoComTermos texto={lei.resumo} />
            </p>
          )}
          {deslizar.lado && (
            <p aria-hidden="true" className="pointer-events-none mt-3 text-center text-[15px] font-extrabold">
              {deslizar.lado === "direita" ? "Solte para aprovar" : "Solte para rejeitar"}
            </p>
          )}
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
              <p className="pt-2 text-center text-[13px] text-suave">Ou deslize o projeto: para a direita aprova, para a esquerda rejeita.</p>
              <div className="flex flex-col items-center pt-1">
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
              {(dados?.link || dados?.linkAutor) && (
                <div className="flex flex-col items-start pt-2">
                  {dados.link && (
                    <LinkTexto href={dados.link} azul externo>
                      Ler o texto oficial na Câmara
                    </LinkTexto>
                  )}
                  {/* Y10: o clique não é registrado em lugar nenhum */}
                  {dados.linkAutor && (
                    <LinkTexto href={dados.linkAutor} azul externo>
                      Ver votações de {dados.autoria} na Câmara
                    </LinkTexto>
                  )}
                </div>
              )}
              {dados?.contexto ? (
                <BotaoPrincipal id="proxima-lei" onClick={() => setNoContexto(true)} className="mt-5 w-full">
                  Ver o contexto da lei
                  <Icone nome="seta" tamanho={20} />
                </BotaoPrincipal>
              ) : (
                <BotaoPrincipal id="proxima-lei" onClick={proxima} className="mt-5 w-full">
                  {fila.length ? "Próxima lei" : "Fechar a sessão"}
                  <Icone nome="seta" tamanho={20} />
                </BotaoPrincipal>
              )}
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
        <PerguntaTrc />
        <div className="px-5 pt-8">
          <BotaoSecundario href="/trilhas" className="w-full">
            Voltar pra trilha
            <Icone nome="seta" tamanho={20} />
          </BotaoSecundario>
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

/* ---------- Y7: deslizar como atalho ---------- */

const LIMIAR = 110; // px até a decisão contar

function useDeslizar(aoDecidir: (lado: "direita" | "esquerda") => void, ativo: boolean) {
  const inicio = useRef<{ x: number; y: number; id: number } | null>(null);
  const [dx, setDx] = useState(0);
  const lado = Math.abs(dx) >= LIMIAR ? (dx > 0 ? ("direita" as const) : ("esquerda" as const)) : null;
  const soltar = () => {
    inicio.current = null;
    if (lado) aoDecidir(lado);
    setDx(0);
  };
  return {
    lado,
    props: ativo
      ? {
          // a rolagem vertical continua normal; só o gesto de lado vira decisão
          style: { touchAction: "pan-y", transform: dx ? `translateX(${dx}px)` : undefined, transition: dx ? "none" : undefined },
          className: "px-5 pt-5 transition-transform duration-200 motion-reduce:transition-none",
          onPointerDown: (e: React.PointerEvent) => {
            if ((e.target as HTMLElement).closest("button, a, input")) return;
            inicio.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          },
          onPointerMove: (e: React.PointerEvent) => {
            const i = inicio.current;
            if (!i || i.id !== e.pointerId) return;
            const mx = e.clientX - i.x;
            if (Math.abs(mx) < 8 || Math.abs(mx) < Math.abs(e.clientY - i.y)) return;
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            setDx(mx);
          },
          onPointerUp: soltar,
          onPointerCancel: () => {
            inicio.current = null;
            setDx(0);
          },
        }
      : {},
  };
}

/* ---------- Tela D9: contexto da lei ---------- */

function ContextoDaLei({
  lei,
  contexto,
  fonte,
  posicao,
  total,
  ultima,
  proxima,
}: {
  lei: LeiCartao;
  contexto: Contexto;
  fonte: "camara" | "exemplo";
  posicao: number;
  total: number;
  ultima: boolean;
  proxima: () => void;
}) {
  // "Você mantém sua avaliação?" fica só na tela, como o voto: nunca é salvo nem enviado
  const [reavaliacao, setReavaliacao] = useState<"mantem" | "mudou" | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);
  const blocos: [string, string | null][] = [
    ["O problema", contexto.problema],
    ["O que muda", contexto.muda],
    ["Quem é afetado", contexto.afetados],
    ["Argumentos", contexto.argumentos],
    ["Onde está agora", contexto.situacao],
  ];
  return (
    <Tela>
      <Cabecalho>
        <span className="text-[13px] font-semibold" aria-hidden="true">
          {posicao} de {total}
        </span>
      </Cabecalho>
      <main className="flex-1 px-5 pb-32">
        <p className="pt-4">
          <Etiqueta cor="azul">Contexto da lei</Etiqueta>
        </p>
        <h1 ref={titulo} tabIndex={-1} className="t-titulo mt-3 outline-none">
          {lei.ementa}
        </h1>
        <dl className="mt-3">
          {blocos
            .filter((b): b is [string, string] => !!b[1])
            .map(([rotulo, texto]) => (
              <div key={rotulo} className="border-b border-linha py-3">
                <dt className="t-rotulo text-azul">{rotulo}</dt>
                <dd className="t-corpo mt-1">
                  <TextoComTermos texto={texto} />
                </dd>
              </div>
            ))}
        </dl>
        <p className="mt-3 text-[13px] text-suave">
          {fonte === "camara" ? "Fonte: Câmara dos Deputados" : "Exemplo ilustrativo"}
        </p>

        <fieldset className="mt-6">
          <legend className="t-subtitulo">Depois de conhecer o contexto, você mantém sua avaliação?</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <BotaoSecundario onClick={() => setReavaliacao("mantem")}>Mantenho</BotaoSecundario>
            <BotaoSecundario onClick={() => setReavaliacao("mudou")}>Mudei de ideia</BotaoSecundario>
          </div>
          <p className="mt-2 text-[13px] text-suave" role="status">
            {reavaliacao === "mantem" ? "Você manteve a sua avaliação. " : reavaliacao === "mudou" ? "Você mudou de ideia. " : ""}
            Sua resposta não é salva. É só pra você pensar.
          </p>
        </fieldset>

        <BotaoPrincipal id="proxima-lei" onClick={proxima} className="mt-6 w-full">
          {ultima ? "Fechar a sessão" : "Próxima lei"}
          <Icone nome="seta" tamanho={20} />
        </BotaoPrincipal>
      </main>
    </Tela>
  );
}

/* ---------- Y11: pergunta da TRC no fim da sessão ---------- */

function PerguntaTrc() {
  const id = useId();
  const [opcoes, setOpcoes] = useState<OpcaoTrc[]>([]);
  const [marcadas, setMarcadas] = useState<number[]>([]);
  const [estado, setEstado] = useState<"perguntando" | "enviando" | "respondida" | "pulada">("perguntando");

  useEffect(() => {
    void fonteDeDados.opcoesTrc().then(setOpcoes);
  }, []);

  const nenhuma = opcoes.find((o) => !o.intencao)?.id;
  const alternar = (o: OpcaoTrc) =>
    setMarcadas((m) =>
      m.includes(o.id)
        ? m.filter((x) => x !== o.id)
        : // "Nenhuma por agora" não combina com as outras
          o.intencao
          ? [...m.filter((x) => x !== nenhuma), o.id]
          : [o.id],
    );

  const enviar = async () => {
    setEstado("enviando");
    try {
      // só a contagem por opção: o banco não guarda quem respondeu
      await fonteDeDados.responderTrc(null, marcadas);
    } finally {
      setEstado("respondida");
    }
  };

  if (estado === "respondida" || estado === "pulada") {
    return (
      <p className="px-5 pt-6 t-corpo" role="status">
        {estado === "respondida" ? "Obrigado. Sua resposta entra só numa contagem geral, sem o seu nome." : "Tudo bem. A pergunta volta no fim da próxima sessão."}
      </p>
    );
  }
  if (!opcoes.length) return null;

  return (
    <section className="px-5 pt-6" aria-labelledby={id}>
      <Cartao className="px-4 pt-4 pb-4">
        <h2 id={id} className="t-subtitulo">
          Depois de usar o politiQ hoje, você pretende fazer alguma destas coisas?
        </h2>
        <p className="mt-1 text-[13px] text-suave">Pode marcar mais de uma. Sua resposta não fica ligada a você.</p>
        <fieldset className="mt-3 flex flex-col gap-2">
          <legend className="sr-only">Opções</legend>
          {opcoes.map((o) => (
            <label key={o.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] border border-linha px-3.5 py-2 has-[:checked]:border-tinta has-[:checked]:bg-claro">
              <input type="checkbox" checked={marcadas.includes(o.id)} onChange={() => alternar(o)} className="size-5 accent-azul" />
              <span className="text-[15px] leading-snug">{o.texto}</span>
            </label>
          ))}
        </fieldset>
        <BotaoPrincipal onClick={enviar} disabled={!marcadas.length || estado === "enviando"} className="mt-4 w-full">
          Enviar
        </BotaoPrincipal>
        <div className="flex justify-center pt-1">
          <LinkTexto onClick={() => setEstado("pulada")}>Agora não</LinkTexto>
        </div>
      </Cartao>
    </section>
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
