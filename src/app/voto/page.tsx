"use client";

import { useEffect, useRef, useState } from "react";
import { leis } from "@/data/leis";
import { useProgresso, type Voto } from "@/lib/progresso";
import { Icone } from "@/components/icones";
import { AvisoExemplo, BotaoAcao, Cabecalho, Janela, LinkSecundario, Manchete, Regua, Selo, Tela } from "@/components/ui";

export default function VotoAsCegas() {
  const { leiAtual, votos, votar, proximaLei, carregado } = useProgresso();
  const lei = leis[leiAtual];
  // o voto desta tela só conta como "revelado" depois que a pessoa decide aqui
  const [decidido, setDecidido] = useState<Voto | null>(null);
  const tituloLei = useRef<HTMLHeadingElement>(null);

  const primeiraLei = useRef(true);
  useEffect(() => {
    // mudou de lei: volta ao estado cego e leva o foco pro título da nova lei
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecidido(null);
    if (primeiraLei.current) {
      primeiraLei.current = false;
      return;
    }
    tituloLei.current?.focus();
  }, [leiAtual]);

  const decidir = (v: Voto) => {
    votar(lei.numero, v);
    setDecidido(v);
    // os botões de voto saem da tela: o foco segue pra próxima ação
    requestAnimationFrame(() => document.getElementById("proxima-lei")?.focus());
  };

  const avancar = () => proximaLei();

  const revelado = decidido !== null;
  const jaVotadas = Object.keys(votos).length;

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete
          sobretitulo={revelado ? "Agora você sabe quem propôs" : "Julgue a ideia, não a pessoa"}
          linha1="Voto às"
          linha2="Cegas"
          numeral={String(leiAtual + 1).padStart(2, "0")}
          numeralRotulo={`de ${leis.length}`}
        />
        <Regua
          total={leis.length}
          feitos={leiAtual}
          atual={leiAtual}
          rotulo={`Lei ${leiAtual + 1} de ${leis.length}. Você já votou em ${jaVotadas}.`}
        />

        <section className="relative px-5 pt-[18px]" aria-label="Projeto de lei">
          <Janela rotulo={`PL ${lei.numero}`} etiqueta={lei.tema} pilha>
            <div className="flex flex-col gap-3 px-5 pt-[18px] pb-[18px] pr-[22px]">
              <h2
                ref={tituloLei}
                tabIndex={-1}
                className="text-[27px] leading-none font-black tracking-[-0.025em] outline-none"
              >
                {lei.ementa}
              </h2>
              <p className="text-[15px] leading-[1.47]">{lei.resumo}</p>
            </div>

            <div className="perfuracao flex flex-col gap-2 px-5 pt-3 pb-3.5">
              <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">
                <Icone nome={revelado ? "olho" : "cadeado"} tamanho={14} />
                {revelado ? "Revelado após o seu voto" : "Oculto até o seu voto"}
              </p>
              <Campo rotulo="Autoria" valor={lei.autoria} larguraTarja="w-[164px]" revelado={revelado} />
              <Campo rotulo="Partido" valor={lei.partido} larguraTarja="w-[54px]" revelado={revelado} />
              <AvisoExemplo />
            </div>
          </Janela>

          {revelado && <Selo voto={decidido} className="absolute right-5 -bottom-11" />}
        </section>

        <div className="px-5 pt-5">
          {!revelado ? (
            <>
              <div
                role="group"
                aria-label="Seu voto sobre a ideia"
                className="btn-acao flex h-[60px] overflow-hidden rounded-[4px] bg-amarelo"
              >
                <BotaoVoto onClick={() => decidir("rejeito")} icone="errado" className="border-r-[2.5px] border-tinta">
                  Rejeito
                </BotaoVoto>
                <BotaoVoto onClick={() => decidir("aprovo")} icone="certo">
                  Aprovo
                </BotaoVoto>
              </div>
              <div className="pt-1.5">
                <LinkSecundario onClick={avancar}>Pular esta lei</LinkSecundario>
              </div>
            </>
          ) : (
            <>
              <BotaoAcao id="proxima-lei" onClick={avancar} className="mt-[34px] w-full">
                Próxima lei
                <Icone nome="seta" />
              </BotaoAcao>
              <div className="pt-1.5">
                <LinkSecundario href="/perfil">Ver meu perfil de prioridades</LinkSecundario>
              </div>
            </>
          )}
          {!carregado && <span className="sr-only">Carregando seu progresso</span>}
        </div>
      </main>
    </Tela>
  );
}

function Campo({ rotulo, valor, larguraTarja, revelado }: { rotulo: string; valor: string; larguraTarja: string; revelado: boolean }) {
  return (
    <div className="flex min-h-7 items-center gap-3">
      <span className="w-[68px] shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-tinta-suave">
        {rotulo}
      </span>
      <span className="relative inline-flex items-center">
        {revelado ? (
          <>
            <span className="anim-revela bg-rosa px-1.5 py-px text-lg leading-tight font-black tracking-[-0.01em]">{valor}</span>
            <span aria-hidden="true" className={`anim-tarja absolute inset-y-0 left-0 bg-tinta ${larguraTarja}`} />
          </>
        ) : (
          <span className={`block h-6 bg-tinta ${larguraTarja}`}>
            <span className="sr-only">oculto até o seu voto</span>
          </span>
        )}
      </span>
    </div>
  );
}

function BotaoVoto({
  children,
  icone,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  icone: "certo" | "errado";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 text-[17px] font-black uppercase tracking-[0.03em] transition-colors duration-100 active:bg-tinta active:text-papel ${className}`}
    >
      <Icone nome={icone} tamanho={20} />
      {children}
    </button>
  );
}
