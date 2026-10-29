import { notFound } from "next/navigation";
import { modulo } from "@/data/trilha";
import Aula from "./aula";

export function generateStaticParams() {
  return modulo.aulas.map((a) => ({ id: a.id }));
}

export default async function Page(props: PageProps<"/aula/[id]">) {
  const { id } = await props.params;
  const aula = modulo.aulas.find((a) => a.id === id);
  if (!aula) notFound();
  return <Aula aula={aula} />;
}
