import { Icone } from "@/components/icones";
import { BotaoPrincipal, Cabecalho, Cartao, Etiqueta, FotoRasgada, Peca, Tela, Titulo } from "@/components/ui";
import fotoBandeira from "@/assets/fotos/bandeira.jpg";

export default function Jogos() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo titulo="Seus " destaque="jogos" />
        <section className="px-5 pt-5" aria-label="Pra jogar agora">
          <Cartao className="px-2 pt-2 pb-4">
            <FotoRasgada
              src={fotoBandeira}
              alt="Bandeira do Brasil hasteada contra o céu"
              className="h-36"
              posicao="center 38%"
            >
              <Peca nome="papel-amarelo" className="-right-2 -bottom-3 w-28 rotate-12" />
              <Peca nome="rabisco-preto" className="top-3 left-3 w-12" />
              <Etiqueta className="absolute -bottom-2 left-2">Disponível</Etiqueta>
            </FotoRasgada>
            <div className="px-2">
              <h2 className="t-titulo mt-5">Voto às Cegas</h2>
              <p className="mt-1.5 text-sm leading-[1.4] text-suave">
                Leia um projeto de lei de verdade, aprove ou rejeite, e só depois descubra quem propôs.
              </p>
              <BotaoPrincipal href="/voto" className="mt-4 w-full">
                Jogar agora
                <Icone nome="seta" tamanho={18} />
              </BotaoPrincipal>
            </div>
          </Cartao>
        </section>
        <p className="px-5 pt-5 text-[15px] text-suave">Mais jogos chegam ao longo do ano.</p>
      </main>
    </Tela>
  );
}
