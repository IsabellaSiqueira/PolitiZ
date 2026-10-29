"use client";

import { useRouter } from "next/navigation";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { BotaoAcao, Cabecalho, Janela, LinkSecundario, Manchete, Tela } from "@/components/ui";

type Linha = { tema: string; votos: number; aprovou: number };

export default function Perfil() {
  const { votos, refazerVotos } = useProgresso();
  const router = useRouter();

  const porTema = new Map<string, Linha>();
  for (const { voto, tema } of Object.values(votos)) {
    const nome = tema ?? "Sem tema definido";
    const l = porTema.get(nome) ?? { tema: nome, votos: 0, aprovou: 0 };
    l.votos += 1;
    if (voto === "aprovo") l.aprovou += 1;
    porTema.set(nome, l);
  }
  const linhas = [...porTema.values()].sort((a, b) => b.aprovou / b.votos - a.aprovou / a.votos || b.votos - a.votos);
  const total = Object.keys(votos).length;

  const refazer = () => {
    refazerVotos();
    router.push("/voto");
  };

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete
          sobretitulo="Calculado pelos seus votos"
          linha1="Seu perfil"
          linha2="de prioridades"
          tamanho="media"
        />
        <p className="max-w-[36ch] px-5 pt-3 text-[15px] leading-[1.45] font-semibold text-papel">
          Mostra quais temas você mais aprovou no Voto às Cegas. São as suas prioridades, não uma posição política.
        </p>

        <section className="px-5 pt-[18px]" aria-label="Temas">
          <Janela rotulo="Prioridades" etiqueta={`${total} ${total === 1 ? "lei julgada" : "leis julgadas"}`}>
            {linhas.length === 0 ? (
              <div className="flex flex-col gap-4 px-5 py-5">
                <p className="text-[15px] leading-[1.47]">
                  Você ainda não votou. Julgue algumas leis sem saber quem propôs e seu perfil aparece aqui.
                </p>
                <BotaoAcao href="/voto" className="w-full">
                  Começar o Voto às Cegas
                  <Icone nome="seta" />
                </BotaoAcao>
              </div>
            ) : (
              <ul className="flex flex-col gap-4 px-5 py-5">
                {linhas.map((l) => {
                  const pct = Math.round((l.aprovou / l.votos) * 100);
                  return (
                    <li key={l.tema} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-base font-semibold">{l.tema}</span>
                        <span className="font-mono text-xs font-semibold uppercase">
                          aprovou {l.aprovou} de {l.votos}
                        </span>
                      </div>
                      <div
                        className="h-2.5 border border-tinta bg-papel"
                        role="meter"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={pct}
                        aria-label={`${l.tema}: aprovou ${l.aprovou} de ${l.votos}`}
                      >
                        <div className="h-full bg-azul" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Janela>
        </section>

        {linhas.length > 0 && (
          <div className="px-5 pt-6">
            <BotaoAcao href="/ferramentas" className="w-full">
              Ver ferramentas
              <Icone nome="seta" />
            </BotaoAcao>
            <div className="pt-1.5">
              <LinkSecundario onClick={refazer}>Refazer o Voto às Cegas</LinkSecundario>
            </div>
          </div>
        )}
      </main>
    </Tela>
  );
}
