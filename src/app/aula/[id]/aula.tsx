"use client";

import type { Aula as TAula } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoPrincipal, CabecalhoTarefa, LinkTexto, Tela, Titulo } from "@/components/ui";

export default function Aula({ aula }: { aula: TAula }) {
  const { aulaLiberada, aulasConcluidas, concluirAula, carregado } = useProgresso();
  const concluida = aulasConcluidas.includes(aula.id);

  if (carregado && !aulaLiberada(aula.numero)) {
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Aula ${aula.numero}`} />
        <main className="flex-1 px-5 pt-8">
          <p className="t-corpo">Esta aula libera depois que você concluir a aula {aula.numero - 1}.</p>
          <BotaoPrincipal href="/" className="mt-6 w-full">Voltar pra trilha</BotaoPrincipal>
        </main>
      </Tela>
    );
  }

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`Aula ${aula.numero} de 4`} />
      <main className="flex-1 pb-10">
        <Titulo rotulo={`Módulo 01 · Aula ${aula.numero}`} titulo={aula.titulo} />
        <section className="flex max-w-[60ch] flex-col gap-4 px-5 pt-5 t-corpo" aria-label="Texto da aula">
          {aula.texto.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
        <div className="px-5 pt-8">
          {concluida ? (
            <>
              <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-azul" role="status">
                <Icone nome="certo" tamanho={18} />
                Aula concluída
              </p>
              <BotaoPrincipal href={`/quiz/${aula.id}`} className="w-full">
                Fazer o quiz
                <Icone nome="seta" tamanho={20} />
              </BotaoPrincipal>
            </>
          ) : (
            <BotaoPrincipal onClick={() => concluirAula(aula.id)} className="w-full">
              Marcar como concluída
              <Icone nome="certo" tamanho={20} />
            </BotaoPrincipal>
          )}
          <div className="flex justify-center pt-2">
            <LinkTexto href="/">Voltar pra trilha</LinkTexto>
          </div>
        </div>
      </main>
    </Tela>
  );
}
