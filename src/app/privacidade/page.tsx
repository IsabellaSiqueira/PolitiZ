import type { Metadata } from "next";
import { Cabecalho, Etiqueta, Tela, Titulo } from "@/components/ui";

export const metadata: Metadata = { title: "Política de privacidade · politiQ" };

// Tela A18. Texto ILUSTRATIVO: precisa da revisão de um advogado antes do lançamento (seção 9 do plano).
const TOPICOS = [
  ["O que coletamos", "Nome de exibição, e-mail, a turma em que você está e seu progresso: aulas lidas, respostas dos quizzes e quais leis você já decidiu."],
  ["O que nunca coletamos", "Como você votou no Voto às Cegas, por que votou e o que respondeu nas perguntas de opinião. Também não usamos anúncios nem rastreadores de outras empresas."],
  ["Para que usamos", "Para guardar seu progresso e, se você está numa turma, mostrar ao professor quantas aulas e quizzes você fez. O professor nunca vê o seu voto."],
  ["Menores de idade", "A maior parte de quem usa o politiQ tem menos de 18 anos. Por isso coletamos só o necessário."],
  ["Seus direitos (LGPD)", "Você pode apagar sua conta a qualquer momento, no perfil. Quem está sem turma e sem usar o app por 12 meses tem a conta apagada."],
];

export default function Privacidade() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo titulo="Política de privacidade" />
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
