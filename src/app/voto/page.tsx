import { Suspense } from "react";
import { connection } from "next/server";
import { buscarLeisRecentes } from "@/lib/camara";
import { leisExemplo } from "@/data/leis";
import type { LeiCartao } from "@/lib/tipos";
import { Cabecalho, Tela, Titulo } from "@/components/ui";
import VotoAsCegas from "./voto-as-cegas";

export default function Page() {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo />
    </Suspense>
  );
}

async function Conteudo() {
  // busca na hora do acesso, não no build: se a Câmara estiver fora no deploy, o site não quebra
  await connection();
  let leis: LeiCartao[];
  let fonte: "camara" | "exemplo";
  try {
    leis = await buscarLeisRecentes();
    fonte = "camara";
  } catch {
    // API fora do ar ou lenta: o app segue com exemplos, avisando na tela
    leis = leisExemplo;
    fonte = "exemplo";
  }
  return <VotoAsCegas leis={leis} fonte={fonte} />;
}

function Carregando() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32" aria-busy="true">
        <Titulo rotulo="Buscando leis na Câmara" titulo="Voto às " destaque="Cegas" />
        <div className="px-5 pt-6">
          <div className="h-80 animate-pulse rounded-2xl border-[1.5px] border-linha bg-claro" />
        </div>
      </main>
    </Tela>
  );
}
