"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Aula, Pergunta } from "@/data/trilha";
import { modulo } from "@/data/trilha";
import { acertosParaAprovar, aprovado, useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { TextoComTermos } from "@/components/glossario";
import {
  BotaoPrincipal,
  BotaoSecundario,
  CabecalhoTarefa,
  Cartao,
  Etiqueta,
  FotoRasgada,
  OpcaoQuiz,
  Peca,
  Regua,
  Tela,
  type EstadoOpcao,
} from "@/components/ui";
import fotoCongresso from "@/assets/fotos/congresso-nacional.jpg";

const LETRAS = ["A", "B", "C", "D", "E"] as const;

type Alternativa = { letra: string; texto: string; correta: boolean };
type PerguntaDaVez = Pick<Pergunta, "enunciado" | "explicacao"> & { alternativas: Alternativa[] };

/** Números aleatórios a partir de uma semente: a ordem só muda quando começa outra tentativa. */
function gerador(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function embaralhar<T>(itens: T[], r: () => number) {
  const lista = [...itens];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

/** Y4: questões e alternativas embaralhadas; as letras A, B, C, D seguem a posição na tela. */
function montar(aula: Aula, semente: number): PerguntaDaVez[] {
  const r = gerador(semente);
  return embaralhar(aula.perguntas, r).map((p) => ({
    enunciado: p.enunciado,
    explicacao: p.explicacao,
    alternativas: embaralhar(p.alternativas, r).map((a, i) => ({ letra: LETRAS[i], texto: a.texto, correta: a.letra === p.correta })),
  }));
}

export default function Quiz({ aula }: { aula: Aula }) {
  const { aulasConcluidas, registrarTentativa, tentativas, carregado } = useProgresso();
  // a semente nasce no navegador, depois da primeira renderização, para o HTML do servidor ser sempre igual
  const [semente, setSemente] = useState<number | null>(null);
  const [indice, setIndice] = useState(0);
  // marcar e confirmar (D10): o passo extra ajuda quem usa leitor de tela e evita chute
  const [marcada, setMarcada] = useState<number | null>(null);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [erradas, setErradas] = useState<string[]>([]);
  const [fim, setFim] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (semente === null) setSemente(crypto.getRandomValues(new Uint32Array(1))[0]);
  }, [semente]);

  const perguntas = useMemo(() => (semente === null ? null : montar(aula, semente)), [aula, semente]);
  const pergunta = perguntas?.[indice];
  const total = aula.perguntas.length;
  const respondida = escolha !== null;
  const acertou = respondida && !!pergunta?.alternativas[escolha].correta;

  useEffect(() => {
    if (respondida) feedback.current?.focus();
  }, [respondida]);

  // o quiz vem depois da leitura: a aula precisa estar marcada como concluída
  if (carregado && !aulasConcluidas.includes(aula.id)) {
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Aula ${aula.numero}`} />
        <main className="flex-1 px-5 pt-8">
          <p className="t-corpo">Leia a aula e marque como concluída antes de fazer o quiz.</p>
          <BotaoPrincipal href={`/aula/${aula.id}`} className="mt-6 w-full">Ir pra aula</BotaoPrincipal>
        </main>
      </Tela>
    );
  }

  const recomecar = () => {
    setSemente(crypto.getRandomValues(new Uint32Array(1))[0]);
    setIndice(0);
    setMarcada(null);
    setEscolha(null);
    setAcertos(0);
    setErradas([]);
    setFim(false);
  };

  const responder = () => {
    if (respondida || marcada === null || !pergunta) return;
    setEscolha(marcada);
    if (pergunta.alternativas[marcada].correta) setAcertos((n) => n + 1);
    else setErradas((e) => [...e, pergunta.enunciado]);
  };

  const continuar = () => {
    if (indice + 1 < total) {
      setIndice(indice + 1);
      setMarcada(null);
      setEscolha(null);
    } else {
      registrarTentativa(aula.id, acertos, total);
      setFim(true);
    }
  };

  if (fim) return <Resultado aula={aula} acertos={acertos} total={total} erradas={erradas} tentativas={tentativas[aula.id]?.length ?? 1} recomecar={recomecar} />;

  if (!pergunta) {
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Quiz da aula ${aula.numero}`} />
        <main className="flex-1" aria-busy="true" />
      </Tela>
    );
  }

  const estadoDe = (i: number): EstadoOpcao => {
    if (!respondida) return i === marcada ? "selecionada" : "padrao";
    if (pergunta.alternativas[i].correta) return "correta";
    if (i === escolha) return "errada";
    return "padrao";
  };
  const certa = pergunta.alternativas.find((a) => a.correta)!;

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`${indice + 1} de ${total}`} />
      <main className="flex-1 pb-10">
        <Regua total={total} feitos={indice + (respondida ? 1 : 0)} atual={respondida ? undefined : indice} rotulo={`Pergunta ${indice + 1} de ${total}`} />
        <div className="px-5 pt-4">
          <p className="t-rotulo mb-2 text-azul">
            Aula {aula.numero} · {aula.titulo}
          </p>
          <h1 className="t-titulo">
            <TextoComTermos texto={pergunta.enunciado} />
          </h1>
        </div>

        <fieldset className="flex flex-col gap-2.5 px-5 pt-6">
          <legend className="sr-only">Escolha uma alternativa</legend>
          {pergunta.alternativas.map((alt, i) => (
            <OpcaoQuiz
              key={alt.texto}
              letra={alt.letra}
              texto={alt.texto}
              estado={estadoDe(i)}
              onClick={() => setMarcada(i)}
              disabled={respondida}
            />
          ))}
        </fieldset>

        {!respondida && (
          <div className="px-5 pt-5">
            <BotaoPrincipal onClick={responder} disabled={marcada === null} className="w-full">
              Responder
            </BotaoPrincipal>
            {marcada === null && <p className="pt-2 text-center text-[13px] text-suave">Escolha uma alternativa para responder.</p>}
          </div>
        )}

        {respondida && (
          <div className="anim-revela px-5 pt-6">
            <div ref={feedback} tabIndex={-1} aria-live="polite" className="outline-none">
              <Cartao className="px-5 pt-5 pb-4">
                <Etiqueta cor={acertou ? "amarelo" : "azul"}>{acertou ? "Resposta correta!" : `A resposta é a ${certa.letra}`}</Etiqueta>
                <p className="t-corpo mt-3">
                  <TextoComTermos texto={pergunta.explicacao} />
                </p>
              </Cartao>
            </div>
            <BotaoPrincipal onClick={continuar} className="mt-5 w-full">
              {indice + 1 < total ? "Próxima pergunta" : "Ver resultado"}
              <Icone nome="seta" tamanho={20} />
            </BotaoPrincipal>
          </div>
        )}
      </main>
    </Tela>
  );
}

/* ---------- Resultado (tela C8 do protótipo) ---------- */

function Resultado({
  aula,
  acertos,
  total,
  erradas,
  tentativas,
  recomecar,
}: {
  aula: Aula;
  acertos: number;
  total: number;
  erradas: string[];
  tentativas: number;
  recomecar: () => void;
}) {
  const passou = aprovado({ acertos, total });
  const faltam = acertosParaAprovar(total) - acertos;
  const seguinte = modulo.aulas.find((a) => a.numero === aula.numero + 1);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`Quiz da aula ${aula.numero}`} />
      <main className="flex-1 pb-10">
        <FotoRasgada src={fotoCongresso} alt="Prédio do Congresso Nacional, em Brasília" className="mx-5 mt-2 h-36" posicao="center 45%">
          <Peca nome="rabisco-azul" className="top-2 right-3 w-14" />
          <Etiqueta className="absolute -bottom-2 left-3">Quiz concluído</Etiqueta>
        </FotoRasgada>
        <div className="px-5 pt-6">
          <h1 ref={titulo} tabIndex={-1} className="t-titulo outline-none">
            Você acertou {acertos} de {total}
          </h1>
          <p className="mt-1 text-[15px] text-suave">
            {aula.titulo} · {modulo.tema}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 px-5 pt-5">
          <div className="flex flex-col-reverse justify-end gap-1 rounded-2xl bg-claro px-4 py-4">
            <dt className="text-[13px] font-semibold">acertos</dt>
            <dd className="text-[32px] leading-none font-extrabold">{acertos}</dd>
          </div>
          <div className="flex flex-col-reverse justify-end gap-1 rounded-2xl bg-amarelo px-4 py-4">
            <dt className="text-[13px] font-semibold">pra revisar</dt>
            <dd className="text-[32px] leading-none font-extrabold">{total - acertos}</dd>
          </div>
        </dl>

        <div className="px-5 pt-5" role="status">
          {passou ? (
            <p className="t-corpo">
              {seguinte ? `Você chegou aos 70%. A aula ${seguinte.numero} está liberada.` : "Você chegou aos 70% e concluiu o módulo."}
            </p>
          ) : (
            <p className="t-corpo">
              Para liberar a próxima aula, acerte pelo menos {acertosParaAprovar(total)} de {total} (70%). Faltou {faltam}{" "}
              {faltam === 1 ? "acerto" : "acertos"}. Você pode refazer quando quiser.
            </p>
          )}
          {tentativas > 1 && <p className="mt-1 text-[13px] text-suave">Esta foi sua tentativa número {tentativas}.</p>}
        </div>

        {erradas.length > 0 && (
          <section className="px-5 pt-5" aria-labelledby="vale-revisar">
            <h2 id="vale-revisar" className="t-subtitulo">
              Vale revisar
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {erradas.map((e) => (
                <li key={e} className="rounded-[14px] border border-linha px-4 py-3">
                  <p className="text-[15px] leading-snug font-semibold">{e}</p>
                  <p className="mt-0.5 text-[13px] text-suave">
                    Aula {aula.numero} · {aula.titulo}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-3 px-5 pt-6">
          {passou ? (
            <>
              <BotaoPrincipal href={seguinte ? `/aula/${seguinte.id}` : "/voto"} className="w-full">
                {seguinte ? "Próxima aula" : "Ir pro Voto às Cegas"}
                <Icone nome="seta" tamanho={20} />
              </BotaoPrincipal>
              <BotaoSecundario onClick={recomecar} className="w-full">
                Refazer o quiz
              </BotaoSecundario>
            </>
          ) : (
            <>
              <BotaoPrincipal onClick={recomecar} className="w-full">
                Refazer o quiz
              </BotaoPrincipal>
              <BotaoSecundario href={`/aula/${aula.id}`} className="w-full">
                Rever a aula
              </BotaoSecundario>
            </>
          )}
        </div>
      </main>
    </Tela>
  );
}
