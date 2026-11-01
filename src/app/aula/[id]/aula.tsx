"use client";

import { modulo, type Aula as TAula } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { TextoComTermos } from "@/components/glossario";
import { BotaoPrincipal, CabecalhoTarefa, Etiqueta, LinkTexto, Tela, Titulo } from "@/components/ui";

/** Frase de abertura conforme a resposta na tela de entrada (Y8). A resposta não é guardada. */
const ABERTURA = { concordo: "Então vamos ver por quê.", discordo: "Então vamos testar essa hipótese." } as const;

export default function Aula({ aula }: { aula: TAula }) {
  const { motivoBloqueio, aulasConcluidas, concluirAula, carregado, postura } = useProgresso();
  const concluida = aulasConcluidas.includes(aula.id);
  const bloqueio = carregado ? motivoBloqueio(aula.numero) : null;
  // cada termo do glossário aparece sublinhado só na primeira vez em toda a aula
  const vistos = new Set<string>();

  if (bloqueio) {
    const { anterior } = bloqueio;
    return (
      <Tela comNavegacao={false}>
        <CabecalhoTarefa contexto={`Aula ${aula.numero}`} />
        <main className="flex-1 px-5 pt-8">
          <p className="t-corpo">
            {bloqueio.tipo === "leitura"
              ? `Esta aula libera depois que você concluir a aula ${anterior.numero}, ${anterior.titulo}.`
              : `Esta aula libera depois que você fizer o quiz da aula ${anterior.numero} com 70% ou mais de acertos.`}
          </p>
          <BotaoPrincipal href={bloqueio.tipo === "leitura" ? `/aula/${anterior.id}` : `/quiz/${anterior.id}`} className="mt-6 w-full">
            {bloqueio.tipo === "leitura" ? `Ir pra aula ${anterior.numero}` : `Fazer o quiz da aula ${anterior.numero}`}
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
          <div className="flex justify-center pt-2">
            <LinkTexto href="/trilhas">Voltar pra trilha</LinkTexto>
          </div>
        </main>
      </Tela>
    );
  }

  return (
    <Tela comNavegacao={false}>
      <CabecalhoTarefa contexto={`Aula ${aula.numero} de ${modulo.aulas.length}`} />
      <main className="flex-1 pb-10">
        {aula.numero === 1 && postura && (
          <p className="px-5 pt-3" role="status">
            <Etiqueta>{ABERTURA[postura]}</Etiqueta>
          </p>
        )}
        <Titulo rotulo={`Módulo 01 · Aula ${aula.numero}`} titulo={aula.titulo} />
        <section className="flex max-w-[60ch] flex-col gap-4 px-5 pt-5 t-corpo" aria-label="Texto da aula">
          {aula.texto.map((p, i) => (
            <p key={i}>
              <TextoComTermos texto={p} vistos={vistos} />
            </p>
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
              {aula.perguntas.length > 0 && (
                <p className="pt-2 text-center text-[13px] text-suave">Com 70% ou mais de acertos, a próxima aula abre.</p>
              )}
            </>
          ) : (
            <BotaoPrincipal onClick={() => concluirAula(aula.id)} className="w-full">
              Marcar como concluída
              <Icone nome="certo" tamanho={20} />
            </BotaoPrincipal>
          )}
          <div className="flex justify-center pt-2">
            <LinkTexto href="/trilhas">Voltar pra trilha</LinkTexto>
          </div>
        </div>
      </main>
    </Tela>
  );
}
