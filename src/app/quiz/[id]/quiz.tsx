"use client";

import { useEffect, useRef, useState } from "react";
import type { Alternativa, Aula } from "@/data/trilha";
import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import {
  BotaoPrincipal,
  CabecalhoTarefa,
  Cartao,
  Etiqueta,
  LinkTexto,
  MarcaTexto,
  OpcaoQuiz,
  Regua,
  Tela,
  Titulo,
  type EstadoOpcao,
} from "@/components/ui";

type Letra = Alternativa["letra"];

export default function Quiz({ aula }: { aula: Aula }) {
  const { aulasConcluidas, registrarTentativa, tentativas, carregado } = useProgresso();
  const [indice, setIndice] = useState(0);
  // marcar e confirmar (D10): o passo extra ajuda quem usa leitor de tela e evita chute
  const [marcada, setMarcada] = useState<Letra | null>(null);
  const [escolha, setEscolha] = useState<Letra | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState(false);
  const feedback = useRef<HTMLDivElement>(null);

  const pergunta = aula.perguntas[indice];
  const total = aula.perguntas.length;
  const respondida = escolha !== null;
  const acertou = escolha === pergunta?.correta;

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
    setIndice(0);
    setMarcada(null);
    setEscolha(null);
    setAcertos(0);
    setFim(false);
  };

  const responder = () => {
    if (respondida || !marcada) return;
    setEscolha(marcada);
    if (marcada === pergunta.correta) setAcertos((n) => n + 1);
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

  if (fim) {
    const seguinte = modulo.aulas.find((a) => a.numero === aula.numero + 1);
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Quiz da aula ${aula.numero}`} />
        <main className="flex-1 pb-10">
          <div className="px-5 pt-4">
            <p className="t-rotulo text-azul">{aula.titulo}</p>
            <h1 className="t-display mt-3">
              <MarcaTexto>
                {acertos} de {total}
              </MarcaTexto>
            </h1>
            <p className="t-subtitulo mt-3">{acertos === total ? "Você acertou tudo." : `Você acertou ${acertos} de ${total} perguntas.`}</p>
            <p className="t-corpo mt-2 text-suave">
              {(tentativas[aula.id]?.length ?? 1) > 1
                ? `Esta foi sua tentativa número ${tentativas[aula.id].length}. Você pode refazer quando quiser.`
                : "Você pode refazer o quiz quando quiser. Suas tentativas ficam no seu histórico."}
            </p>
          </div>
          <div className="px-5 pt-8">
            {seguinte ? (
              <BotaoPrincipal href={`/aula/${seguinte.id}`} className="w-full">
                Próxima aula
                <Icone nome="seta" tamanho={20} />
              </BotaoPrincipal>
            ) : (
              <BotaoPrincipal href="/voto" className="w-full">
                Ir pro Voto às Cegas
                <Icone nome="seta" tamanho={20} />
              </BotaoPrincipal>
            )}
            <div className="flex flex-col items-center pt-2">
              <LinkTexto onClick={recomecar}>Refazer o quiz</LinkTexto>
              <LinkTexto href="/trilhas">Voltar pra trilha</LinkTexto>
            </div>
          </div>
        </main>
      </Tela>
    );
  }

  const estadoDe = (letra: Letra): EstadoOpcao => {
    if (!respondida) return letra === marcada ? "selecionada" : "padrao";
    if (letra === pergunta.correta) return "correta";
    if (letra === escolha) return "errada";
    return "padrao";
  };

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`${indice + 1} de ${total}`} />
      <main className="flex-1 pb-10">
        <Regua total={total} feitos={indice + (respondida ? 1 : 0)} atual={respondida ? undefined : indice} rotulo={`Pergunta ${indice + 1} de ${total}`} />
        <Titulo rotulo={`Aula ${aula.numero} · ${aula.titulo}`} titulo={pergunta.enunciado} />

        <fieldset className="flex flex-col gap-2.5 px-5 pt-6">
          <legend className="sr-only">Escolha uma alternativa</legend>
          {pergunta.alternativas.map((alt) => (
            <OpcaoQuiz
              key={alt.letra}
              letra={alt.letra}
              texto={alt.texto}
              estado={estadoDe(alt.letra)}
              onClick={() => setMarcada(alt.letra)}
              disabled={respondida}
            />
          ))}
        </fieldset>

        {!respondida && (
          <div className="px-5 pt-5">
            <BotaoPrincipal onClick={responder} disabled={!marcada} className="w-full">
              Responder
            </BotaoPrincipal>
            {!marcada && <p className="pt-2 text-center text-[13px] text-suave">Escolha uma alternativa para responder.</p>}
          </div>
        )}

        {respondida && (
          <div className="anim-revela px-5 pt-6">
            <div ref={feedback} tabIndex={-1} aria-live="polite" className="outline-none">
              <Cartao className="px-5 pt-5 pb-4">
                <Etiqueta cor={acertou ? "amarelo" : "azul"}>{acertou ? "Resposta correta!" : `A resposta é a ${pergunta.correta}`}</Etiqueta>
                <p className="t-corpo mt-3">{pergunta.explicacao}</p>
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
