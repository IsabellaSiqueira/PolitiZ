"use client";

import { useRouter } from "next/navigation";
import { modulo } from "@/data/trilha";
import { useProgresso, type Postura } from "@/lib/progresso";
import { BotaoSecundario, CabecalhoTarefa, Etiqueta, Tela } from "@/components/ui";

/**
 * Tela de entrada do módulo (Y8): uma afirmação para o aluno entrar como debatedor.
 * A resposta só muda a frase de abertura da primeira aula e nunca é gravada (X7).
 */
export default function Entrada() {
  const router = useRouter();
  const { escolherPostura } = useProgresso();
  const primeira = modulo.aulas[0];

  const escolher = (p: Postura) => {
    escolherPostura(p);
    router.push(`/aula/${primeira.id}`);
  };

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`Módulo ${String(modulo.numero).padStart(2, "0")}`} glossario={false} />
      <main className="flex flex-1 flex-col px-5 pt-6 pb-10">
        <p>
          <Etiqueta>Antes de começar</Etiqueta>
        </p>
        <h1 className="t-display mt-5">Todo mundo já votou em algo sem entender no que estava votando. Inclusive você.</h1>
        <p className="t-subtitulo mt-5">Você concorda?</p>
        {/* os dois lados com o mesmo peso: a tela não sugere resposta */}
        <div role="group" aria-label="Sua resposta" className="mt-5 grid grid-cols-2 gap-3">
          <BotaoSecundario onClick={() => escolher("concordo")}>Concordo</BotaoSecundario>
          <BotaoSecundario onClick={() => escolher("discordo")}>Discordo</BotaoSecundario>
        </div>
        <p className="mt-3 text-[13px] text-suave">Sua resposta não é salva. Ela só muda a frase de abertura da primeira aula.</p>
      </main>
    </Tela>
  );
}
