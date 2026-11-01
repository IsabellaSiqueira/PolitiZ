import type { Metadata } from "next";
import { ListaGlossario } from "@/components/glossario";
import { Cabecalho, Tela, Titulo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Glossário · politiQ",
  description: "Os termos de política explicados em linguagem simples.",
};

export default function Glossario() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo rotulo="Módulo 01" titulo="Glossário" apoio="Os termos das aulas, explicados do zero. Nas aulas, toque no termo sublinhado para ver a definição." />
        <ListaGlossario />
      </main>
    </Tela>
  );
}
