import { notFound } from "next/navigation";
import { modulo } from "@/data/trilha";
import Quiz from "./quiz";

export function generateStaticParams() {
  return modulo.aulas.map((a) => ({ id: a.id }));
}

export default async function Page(props: PageProps<"/quiz/[id]">) {
  const { id } = await props.params;
  const aula = modulo.aulas.find((a) => a.id === id);
  if (!aula) notFound();
  return <Quiz aula={aula} />;
}
