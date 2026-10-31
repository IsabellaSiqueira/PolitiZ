"use client";

import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoPrincipal, Cabecalho, Cartao, Tela, Titulo } from "@/components/ui";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Perfil() {
  const { aulasConcluidas, tentativas, decididas } = useProgresso();
  const concluidas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id)).length;
  const comTentativa = modulo.aulas.filter((a) => tentativas[a.id]?.length);

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo rotulo="Seu histórico" titulo="Seu " destaque="progresso" />

        <dl className="grid grid-cols-2 gap-3 px-5 pt-5">
          <Numero rotulo="Aulas concluídas" valor={`${concluidas}/${modulo.aulas.length}`} />
          <Numero rotulo="Decisões no Voto às Cegas" valor={String(decididas.length)} />
        </dl>
        <p className="px-5 pt-3 text-sm leading-snug text-suave">
          O politiQ conta quantas decisões você tomou, nunca qual foi o seu voto.
        </p>

        <section className="px-5 pt-5" aria-label="Histórico de quizzes">
          <Cartao rotulo="Histórico de quizzes" etiqueta={`${comTentativa.length} aula${comTentativa.length === 1 ? "" : "s"}`}>
            {comTentativa.length === 0 ? (
              <div className="flex flex-col gap-4 px-5 pt-2 pb-5">
                <p className="t-corpo">Você ainda não fez nenhum quiz. Leia a primeira aula e faça o quiz no final.</p>
                <BotaoPrincipal href="/trilhas" className="w-full">
                  Ir pra trilha
                  <Icone nome="seta" tamanho={20} />
                </BotaoPrincipal>
              </div>
            ) : (
              <ul className="pt-1">
                {comTentativa.map((a, i) => {
                  const lista = tentativas[a.id];
                  return (
                    <li key={a.id} className={`px-5 py-4 ${i ? "border-t border-linha" : ""}`}>
                      <p className="text-base font-bold">
                        Aula {a.numero} · {a.titulo}
                      </p>
                      <ol className="mt-2 flex flex-col gap-1">
                        {lista
                          .slice()
                          .reverse()
                          .map((t, j) => (
                            <li key={t.em} className="flex justify-between text-[13px] text-suave">
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
          </Cartao>
        </section>
      </main>
    </Tela>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-2 rounded-2xl border-[1.5px] border-linha bg-branco px-4 py-4">
      <dt className="text-[13px] leading-tight font-semibold text-suave">{rotulo}</dt>
      <dd className="text-[32px] leading-none font-extrabold tracking-[-0.03em]">{valor}</dd>
    </div>
  );
}
