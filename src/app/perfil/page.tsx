"use client";

import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoAcao, Cabecalho, Janela, Manchete, Tela } from "@/components/ui";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Perfil() {
  const { aulasConcluidas, tentativas, decididas } = useProgresso();
  const concluidas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id)).length;
  const comTentativa = modulo.aulas.filter((a) => tentativas[a.id]?.length);

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete sobretitulo="Seu histórico" linha1="Seu" linha2="progresso" />

        <dl className="grid grid-cols-2 gap-3 px-5 pt-5">
          <Numero rotulo="Aulas concluídas" valor={`${concluidas}/${modulo.aulas.length}`} />
          <Numero rotulo="Decisões no Voto às Cegas" valor={String(decididas.length)} />
        </dl>
        <p className="px-5 pt-3 text-sm leading-snug font-semibold text-papel">
          O politiQ conta quantas decisões você tomou, nunca qual foi o seu voto.
        </p>

        <section className="px-5 pt-5" aria-label="Histórico de quizzes">
          <Janela rotulo="Histórico de quizzes" etiqueta={`${comTentativa.length} aula${comTentativa.length === 1 ? "" : "s"}`}>
            {comTentativa.length === 0 ? (
              <div className="flex flex-col gap-4 px-5 py-5">
                <p className="text-[15px] leading-[1.47]">Você ainda não fez nenhum quiz. Leia a primeira aula e faça o quiz no final.</p>
                <BotaoAcao href="/" className="w-full">
                  Ir pra trilha
                  <Icone nome="seta" />
                </BotaoAcao>
              </div>
            ) : (
              <ul>
                {comTentativa.map((a, i) => {
                  const lista = tentativas[a.id];
                  return (
                    <li key={a.id} className={`px-5 py-4 ${i ? "border-t-[1.5px] border-tinta/15" : ""}`}>
                      <p className="text-base font-semibold">
                        Aula {a.numero} · {a.titulo}
                      </p>
                      <ol className="mt-2 flex flex-col gap-1">
                        {lista
                          .slice()
                          .reverse()
                          .map((t, j) => (
                            <li key={t.em} className="flex justify-between font-mono text-xs uppercase">
                              <span>Tentativa {lista.length - j}</span>
                              <span>
                                {t.acertos} de {t.total} · {data.format(new Date(t.em))}
                              </span>
                            </li>
                          ))}
                      </ol>
                    </li>
                  );
                })}
              </ul>
            )}
          </Janela>
        </section>
      </main>
    </Tela>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[3px] border-2 border-tinta bg-papel px-4 py-3">
      <dt className="font-mono text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] text-tinta-suave">{rotulo}</dt>
      <dd className="text-[32px] leading-none font-black">{valor}</dd>
    </div>
  );
}
