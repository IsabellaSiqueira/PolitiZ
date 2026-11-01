import { Suspense } from "react";
import PainelTurma from "./painel-turma";

// o id da turma vem do banco: a tela é montada na hora, dentro do Suspense
export function generateStaticParams() {
  return [{ id: "turma-exemplo" }];
}

async function Conteudo({ params }: { params: PageProps<"/painel/turma/[id]">["params"] }) {
  const { id } = await params;
  return <PainelTurma id={id} />;
}

export default function Page(props: PageProps<"/painel/turma/[id]">) {
  return (
    <Suspense>
      <Conteudo params={props.params} />
    </Suspense>
  );
}
