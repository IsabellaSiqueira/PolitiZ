import type { Metadata } from "next";
import { Cabecalho, Etiqueta, Tela, Titulo } from "@/components/ui";

export const metadata: Metadata = { title: "Termos de uso · politiQ" };

// Tela A17. Texto ILUSTRATIVO, como no protótipo: precisa da revisão de um advogado antes do lançamento.
const TOPICOS = [
  ["O que é o politiQ", "Um app de educação política para estudantes, usado pela escola ou por conta própria."],
  ["Sua conta", "A conta é pessoal. Guarde sua senha e não compartilhe com ninguém."],
  ["O que você pode fazer", "Estudar, fazer os quizzes e jogar o Voto às Cegas. Não há espaço para publicar textos ou comentários."],
  ["O conteúdo", "As aulas e os resumos de leis são escritos e revisados pela equipe, com base em fontes oficiais."],
  ["Mudanças", "Se os termos mudarem, avisamos no app e pedimos um novo aceite."],
];

export default function Termos() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo titulo="Termos de uso" />
        <p className="px-5 pt-3">
          <Etiqueta cor="azul">Texto ilustrativo, em revisão jurídica</Etiqueta>
        </p>
        <div className="flex flex-col gap-5 px-5 pt-5">
          {TOPICOS.map(([t, x]) => (
            <section key={t}>
              <h2 className="t-subtitulo">{t}</h2>
              <p className="t-corpo mt-1">{x}</p>
            </section>
          ))}
        </div>
      </main>
    </Tela>
  );
}
