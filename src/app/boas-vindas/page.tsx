"use client";

import { useState } from "react";
import { BotaoPrincipal, LinkTexto, Tela } from "@/components/ui";
import { Icone } from "@/components/icones";

// Telas A9 a A11. A A11 do protótipo fala dos jogos com as cartas do Plenário, que estão fora
// do MVP; aqui ela fala do que existe: o glossário e o professor acompanhando a turma.
const PASSOS = [
  { titulo: "Aprenda do zero", texto: "Aulas curtas e um quiz no fim de cada uma. Todo termo difícil vem explicado." },
  { titulo: "Julgue a ideia, não a pessoa", texto: "No Voto às Cegas, você decide sobre leis de verdade e só depois descobre quem propôs." },
  { titulo: "No seu ritmo", texto: "Seu progresso fica salvo. Se você está numa turma, o professor acompanha as aulas, nunca o seu voto." },
];

export default function BoasVindas() {
  const [passo, setPasso] = useState(0);
  const p = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;
  return (
    <Tela comNavegacao={false}>
      <main className="flex flex-1 flex-col px-5 pt-[max(24px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
        <p className="t-rotulo text-azul" aria-live="polite">
          {passo + 1} de {PASSOS.length}
        </p>
        <h1 className="t-display mt-4">{p.titulo}</h1>
        <p className="t-corpo mt-3">{p.texto}</p>
        <div className="mt-auto flex justify-center gap-2 pb-5" aria-hidden="true">
          {PASSOS.map((_, i) => (
            <span key={i} className={`h-2 rounded-full ${i === passo ? "w-6 bg-azul" : "w-2 bg-linha"}`} />
          ))}
        </div>
        {ultimo ? (
          <BotaoPrincipal href="/" className="w-full">
            Começar
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
        ) : (
          <BotaoPrincipal onClick={() => setPasso(passo + 1)} className="w-full">
            Próximo
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
        )}
        <div className="flex justify-center pt-1">
          <LinkTexto href="/">Pular</LinkTexto>
        </div>
      </main>
    </Tela>
  );
}
