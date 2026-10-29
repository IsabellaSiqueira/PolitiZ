"use client";

import Link from "next/link";
import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { Cabecalho, Janela, Manchete, Regua, Tela } from "@/components/ui";

export default function Trilhas() {
  const { aulasFeitas, aulaLiberada } = useProgresso();
  const feitas = modulo.aulas.filter((a) => aulasFeitas.includes(a.id)).length;
  const proxima = modulo.aulas.find((a) => !aulasFeitas.includes(a.id) && aulaLiberada(a.numero));

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete
          sobretitulo={`Módulo ${String(modulo.numero).padStart(2, "0")} · ${modulo.tema}`}
          linha1="Quem manda"
          linha2="em quê?"
          tamanho="media"
        />
        <p className="max-w-[34ch] px-5 pt-3 text-[15px] leading-[1.45] font-semibold text-papel">{modulo.descricao}</p>
        <Regua
          total={modulo.aulas.length}
          feitos={feitas}
          atual={proxima ? proxima.numero - 1 : undefined}
          rotulo={`${feitas} de ${modulo.aulas.length} aulas feitas`}
        />

        <section className="px-5 pt-[18px]" aria-label="Sua trilha">
          <Janela rotulo="Sua trilha" etiqueta={`${feitas}/${modulo.aulas.length} feitas`} pilha>
            <ol>
              {modulo.aulas.map((a, i) => {
                const feita = aulasFeitas.includes(a.id);
                const liberada = aulaLiberada(a.numero);
                const atual = proxima?.id === a.id;
                const ultima = i === modulo.aulas.length - 1;
                const linha = `flex min-h-[76px] items-center gap-4 px-5 py-3.5 ${ultima ? "" : "border-b-[1.5px] border-tinta/15"}`;
                const numero = (
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center text-[28px] leading-none font-black ${
                      atual ? "bg-amarelo" : ""
                    } ${liberada ? "text-tinta" : "text-tinta-suave"}`}
                  >
                    {a.numero}
                  </span>
                );
                const textos = (
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`text-base leading-tight font-semibold ${liberada ? "" : "text-tinta-suave"}`}>{a.titulo}</span>
                    <span className="text-sm text-tinta-suave">
                      {liberada ? `Quiz · ${a.perguntas.length} perguntas` : `Libera depois da aula ${a.numero - 1}`}
                    </span>
                  </span>
                );
                if (!liberada) {
                  return (
                    <li key={a.id} className={linha}>
                      {numero}
                      {textos}
                      <Icone nome="cadeado" tamanho={20} className="text-tinta-suave" />
                      <span className="sr-only">Bloqueada</span>
                    </li>
                  );
                }
                return (
                  <li key={a.id}>
                    <Link href={`/quiz/${a.id}`} className={`${linha} active:bg-amarelo/30`}>
                      {numero}
                      {textos}
                      {feita ? (
                        <span className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-certo">
                          <Icone nome="certo" tamanho={18} />
                          Feita
                        </span>
                      ) : (
                        <span className="btn-acao flex items-center gap-1.5 rounded-[4px] bg-amarelo px-3 py-2 text-[13px] font-black uppercase tracking-[0.04em]">
                          Jogar
                          <Icone nome="seta" tamanho={16} />
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Janela>
        </section>
      </main>
    </Tela>
  );
}
