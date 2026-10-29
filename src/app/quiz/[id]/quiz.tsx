"use client";

import { useEffect, useRef, useState } from "react";
import type { Alternativa, Aula } from "@/data/trilha";
import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoAcao, CabecalhoTarefa, Janela, LinkSecundario, Manchete, Regua, Tela } from "@/components/ui";

type Letra = Alternativa["letra"];

export default function Quiz({ aula }: { aula: Aula }) {
  const { aulaLiberada, concluirAula, aulasFeitas, carregado } = useProgresso();
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<Letra | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);
  // guardado antes de concluir: diz se os pontos desta rodada contaram ou não
  const [jaFeita, setJaFeita] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);

  const pergunta = aula.perguntas[indice];
  const total = aula.perguntas.length;
  const respondida = escolha !== null;
  const acertou = escolha === pergunta?.correta;

  useEffect(() => {
    if (respondida) feedback.current?.focus();
  }, [respondida]);

  if (carregado && !aulaLiberada(aula.numero)) {
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Aula ${aula.numero}`} />
        <main className="flex-1 px-5 pt-8">
          <p className="text-[15px] font-semibold text-papel">
            Esta aula libera depois que você concluir a aula {aula.numero - 1}.
          </p>
          <BotaoAcao href="/" className="mt-6 w-full">Voltar pra trilha</BotaoAcao>
        </main>
      </Tela>
    );
  }

  const responder = (letra: Letra) => {
    if (respondida) return;
    setEscolha(letra);
    if (letra === pergunta.correta) setAcertos((n) => n + 1);
  };

  const continuar = () => {
    if (indice + 1 < total) {
      setIndice(indice + 1);
      setEscolha(null);
    } else {
      setJaFeita(aulasFeitas.includes(aula.id));
      concluirAula(aula.id, acertos);
      setFim(true);
    }
  };

  if (fim) {
    const seguinte = modulo.aulas.find((a) => a.numero === aula.numero + 1);
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Aula ${aula.numero} concluída`} />
        <main className="flex-1 pb-10">
          <Manchete sobretitulo={aula.titulo} linha1="Você" linha2="acertou" numeral={String(acertos)} numeralRotulo={`de ${total}`} tamanho="media" />
          <p className="px-5 pt-4 text-[15px] leading-[1.45] font-semibold text-papel">
            {jaFeita ? "Você já tinha concluído esta aula, então os pontos não foram somados de novo." : `+${acertos * 10} pontos na sua conta.`}
          </p>
          <div className="px-5 pt-6">
            {seguinte ? (
              <BotaoAcao href={`/quiz/${seguinte.id}`} className="w-full">
                Próxima aula
                <Icone nome="seta" />
              </BotaoAcao>
            ) : (
              <BotaoAcao href="/voto" className="w-full">
                Ir pro Voto às Cegas
                <Icone nome="seta" />
              </BotaoAcao>
            )}
            <div className="pt-1.5">
              <LinkSecundario href="/">Voltar pra trilha</LinkSecundario>
            </div>
          </div>
        </main>
      </Tela>
    );
  }

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`Pergunta ${indice + 1} de ${total}`} />
      <main className="flex-1 pb-10">
        <Regua total={total} feitos={indice + (respondida ? 1 : 0)} atual={respondida ? undefined : indice} rotulo={`Pergunta ${indice + 1} de ${total}`} />
        <div className="px-5 pt-5">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-amarelo">
            Aula {aula.numero} · {aula.titulo}
          </p>
          <h1 className="mt-2 text-[28px] leading-[1.04] font-black tracking-[-0.02em] text-papel">{pergunta.enunciado}</h1>
        </div>

        <fieldset className="flex flex-col gap-3 px-5 pt-6">
          <legend className="sr-only">Escolha uma alternativa</legend>
          {pergunta.alternativas.map((alt) => {
            const certa = respondida && alt.letra === pergunta.correta;
            const errada = respondida && alt.letra === escolha && !acertou;
            const neutra = respondida && !certa && !errada;
            return (
              <button
                key={alt.letra}
                type="button"
                onClick={() => responder(alt.letra)}
                disabled={respondida}
                aria-pressed={escolha === alt.letra}
                className={`flex min-h-14 items-center gap-3 rounded-[4px] border-2 px-3 py-2.5 text-left text-base transition-colors duration-200 ${
                  certa
                    ? "border-tinta bg-limao"
                    : errada
                      ? "border-tinta bg-rosa"
                      : neutra
                        ? "border-papel/40 bg-transparent text-papel"
                        : "btn-acao border-tinta bg-papel"
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] font-semibold ${
                    certa || errada ? "border-tinta bg-tinta text-papel" : neutra ? "border-papel/40" : "border-tinta"
                  }`}
                >
                  {certa ? <Icone nome="certo" tamanho={18} /> : errada ? <Icone nome="errado" tamanho={18} /> : alt.letra}
                </span>
                <span className="flex-1">{alt.texto}</span>
                {certa && <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]">Correta</span>}
                {errada && <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em]">Sua resposta</span>}
              </button>
            );
          })}
        </fieldset>

        {respondida && (
          <div className="anim-revela px-5 pt-6">
            <div ref={feedback} tabIndex={-1} aria-live="polite" className="outline-none">
              <Janela rotulo={acertou ? "Isso. Por quê?" : `A resposta é a ${pergunta.correta}. Por quê?`}>
                <p className="px-5 py-4 text-[15px] leading-[1.47]">{pergunta.explicacao}</p>
              </Janela>
            </div>
            <BotaoAcao onClick={continuar} className="mt-5 w-full">
              {indice + 1 < total ? "Próxima pergunta" : "Ver resultado"}
              <Icone nome="seta" />
            </BotaoAcao>
          </div>
        )}
      </main>
    </Tela>
  );
}
