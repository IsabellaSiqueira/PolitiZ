"use client";

import type { Aula as TAula } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoAcao, CabecalhoTarefa, Janela, LinkSecundario, Manchete, Tela } from "@/components/ui";

export default function Aula({ aula }: { aula: TAula }) {
  const { aulaLiberada, aulasConcluidas, concluirAula, carregado } = useProgresso();
  const concluida = aulasConcluidas.includes(aula.id);

  if (carregado && !aulaLiberada(aula.numero)) {
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Aula ${aula.numero}`} />
        <main className="flex-1 px-5 pt-8">
          <p className="text-[15px] font-semibold text-papel">Esta aula libera depois que você concluir a aula {aula.numero - 1}.</p>
          <BotaoAcao href="/" className="mt-6 w-full">Voltar pra trilha</BotaoAcao>
        </main>
      </Tela>
    );
  }

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`Aula ${aula.numero} de 4`} />
      <main className="flex-1 pb-10">
        <Manchete sobretitulo={`Módulo 01 · Aula ${aula.numero}`} linha1={aula.titulo} tamanho="media" />
        <section className="px-5 pt-5" aria-label="Texto da aula">
          <Janela rotulo="Leitura" etiqueta={concluida ? "Concluída" : undefined}>
            <div className="flex max-w-[60ch] flex-col gap-4 px-5 py-5 text-base leading-[1.6]">
              {aula.texto.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Janela>
        </section>
        <div className="px-5 pt-6">
          {concluida ? (
            <>
              <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-papel" role="status">
                <Icone nome="certo" tamanho={18} />
                Aula concluída
              </p>
              <BotaoAcao href={`/quiz/${aula.id}`} className="w-full">
                Fazer o quiz
                <Icone nome="seta" />
              </BotaoAcao>
            </>
          ) : (
            <BotaoAcao onClick={() => concluirAula(aula.id)} className="w-full">
              <Icone nome="certo" />
              Marcar como concluída
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
