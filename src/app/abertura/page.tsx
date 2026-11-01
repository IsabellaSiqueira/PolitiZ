import { BotaoPrincipal, Etiqueta, FotoRasgada, LinkTexto, Logo, Peca, Tela } from "@/components/ui";
import { Icone } from "@/components/icones";
import fotoCongresso from "@/assets/fotos/congresso-nacional.jpg";

/** Tela A0 do protótipo: abertura do app. */
export default function Abertura() {
  return (
    <Tela comNavegacao={false}>
      <main className="flex flex-1 flex-col pb-[max(20px,env(safe-area-inset-bottom))]">
        <FotoRasgada src={fotoCongresso} alt="Prédio do Congresso Nacional, em Brasília" className="mx-3 mt-3 h-[52dvh] min-h-64" posicao="center 40%" preload>
          <Peca nome="papel-azul" className="-top-3 -left-3 w-36 -rotate-10" />
          <Peca nome="coroa" className="top-4 right-4 w-14 rotate-8" />
          <Peca nome="papel-amarelo" className="-right-2 bottom-10 w-32 rotate-12" />
          <Etiqueta className="absolute -bottom-2 left-3">Entenda. Questione. Participe.</Etiqueta>
        </FotoRasgada>
        <div className="mt-auto px-5 pt-8">
          <h1>
            <Logo className="text-[64px]" />
          </h1>
          <p className="t-corpo mt-2 font-medium">Entender o Brasil também é uma forma de participar dele.</p>
          <BotaoPrincipal href="/criar-conta" className="mt-6 w-full">
            Começar
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
          <div className="flex justify-center pt-1">
            <LinkTexto href="/entrar">Já tenho uma conta</LinkTexto>
          </div>
        </div>
      </main>
    </Tela>
  );
}
