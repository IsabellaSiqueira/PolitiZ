"use client";

import Link from "next/link";
import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { Cabecalho, Cartao, Etiqueta, FotoRasgada, Peca, Regua, Tela, Titulo } from "@/components/ui";
import fotoCapa from "@/assets/fotos/candangos-congresso.jpg";

export default function Trilhas() {
  const { aulasConcluidas, aulaLiberada, tentativas } = useProgresso();
  const feitas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id)).length;
  const proxima = modulo.aulas.find((a) => !aulasConcluidas.includes(a.id) && aulaLiberada(a.numero));

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <FotoRasgada
          src={fotoCapa}
          alt="Escultura Os Candangos e as torres do Congresso Nacional, na Praça dos Três Poderes, em Brasília"
          className="mx-5 mt-2 h-44"
          posicao="center 40%"
          preload
        >
          <Peca nome="papel-azul" className="-top-3 -left-3 w-28 -rotate-6" />
          <Peca nome="coroa" className="top-3 right-4 w-14 rotate-8" />
          <Etiqueta className="absolute -bottom-2 left-3">Módulo {String(modulo.numero).padStart(2, "0")}</Etiqueta>
        </FotoRasgada>
        <Titulo
          rotulo={modulo.tema}
          titulo="Quem manda em "
          destaque="quê?"
          apoio={modulo.descricao}
        />
        <Regua
          total={modulo.aulas.length}
          feitos={feitas}
          atual={proxima ? proxima.numero - 1 : undefined}
          rotulo={`${feitas} de ${modulo.aulas.length} aulas concluídas`}
        />

        <section className="px-5 pt-5" aria-label="Sua trilha">
          <Cartao rotulo="Sua trilha" etiqueta={`${feitas} de ${modulo.aulas.length} concluídas`}>
            <ol className="pt-2">
              {modulo.aulas.map((a, i) => {
                const feita = aulasConcluidas.includes(a.id);
                const liberada = aulaLiberada(a.numero);
                const atual = proxima?.id === a.id;
                const ultima = i === modulo.aulas.length - 1;
                const linha = `flex min-h-[76px] items-center gap-4 px-5 py-3.5 ${ultima ? "rounded-b-2xl" : "border-b border-linha"}`;
                const numero = (
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${
                      atual ? "bg-amarelo text-tinta" : feita ? "bg-azul text-branco" : liberada ? "border border-linha" : "border border-linha text-suave"
                    }`}
                  >
                    {feita ? <Icone nome="certo" tamanho={18} /> : a.numero}
                  </span>
                );
                const textos = (
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={`text-base leading-tight font-bold ${liberada ? "" : "text-suave"}`}>{a.titulo}</span>
                    <span className="text-sm text-suave">
                      {!liberada
                        ? `Libera depois da aula ${a.numero - 1}`
                        : melhor(tentativas[a.id])
                          ? `Melhor quiz: ${melhor(tentativas[a.id])}`
                          : `Leitura + quiz de ${a.perguntas.length} perguntas`}
                    </span>
                  </span>
                );
                if (!liberada) {
                  return (
                    <li key={a.id} className={linha}>
                      {numero}
                      {textos}
                      <Icone nome="cadeado" tamanho={20} className="text-suave" />
                      <span className="sr-only">Bloqueada</span>
                    </li>
                  );
                }
                return (
                  <li key={a.id}>
                    <Link href={`/aula/${a.id}`} className={`${linha} active:bg-claro`}>
                      {numero}
                      {textos}
                      {feita ? (
                        <span className="text-[13px] font-semibold text-azul">Concluída</span>
                      ) : atual ? (
                        <Etiqueta>Agora</Etiqueta>
                      ) : (
                        <Icone nome="seta" tamanho={20} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Cartao>
        </section>
      </main>
    </Tela>
  );
}

function melhor(t?: { acertos: number; total: number }[]) {
  if (!t?.length) return null;
  const m = t.reduce((a, b) => (b.acertos / b.total > a.acertos / a.total ? b : a));
  return `${m.acertos} de ${m.total}`;
}
