import { TelaPasso } from "@/components/entrada";

// Tela F6. Perguntas frequentes com as regras do app. O contato geral ainda não foi definido
// (o e-mail leis@ é só para correção de resumos de lei).
const PERGUNTAS = [
  ["O professor vê como eu votei?", "Não. Ninguém vê. O politiQ guarda só que você decidiu sobre uma lei, nunca se aprovou ou rejeitou."],
  ["Por que a próxima aula está bloqueada?", "Ela abre quando você lê a aula anterior e faz o quiz dela com 70% ou mais de acertos. Pode refazer o quiz quantas vezes quiser."],
  ["O que são as vidas do plano gratuito?", "Sem turma, você tem 5 aulas novas e 5 decisões no Voto às Cegas por dia. Elas voltam à meia-noite. Errar no quiz não gasta nada."],
  ["Onde acho o código da minha turma?", "Com o seu professor. São 8 letras e números."],
  ["Como as leis são escolhidas?", "Por regras públicas, explicadas na página Como as leis são escolhidas, no Voto às Cegas."],
];

export default function Ajuda() {
  return (
    <TelaPasso titulo="Ajuda" voltar="/perfil">
      <h1 className="t-titulo pt-4">Perguntas frequentes</h1>
      <div className="mt-4 flex flex-col gap-2">
        {PERGUNTAS.map(([p, r]) => (
          <details key={p} className="group rounded-2xl border-[1.5px] border-linha px-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 text-base font-bold">
              {p}
              <span aria-hidden="true" className="text-xl text-suave group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="t-corpo pb-4 text-suave">{r}</p>
          </details>
        ))}
      </div>
    </TelaPasso>
  );
}
