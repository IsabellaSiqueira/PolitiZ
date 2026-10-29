import type { Metadata } from "next";
import { Cabecalho, Janela, LinkSecundario, Manchete, Tela } from "@/components/ui";

export const metadata: Metadata = {
  title: "Como as leis são escolhidas · politiQ",
  description: "O critério de seleção dos projetos de lei do Voto às Cegas.",
};

const blocos: { titulo: string; texto: string[] }[] = [
  {
    titulo: "Quais leis aparecem",
    texto: [
      "Cada sessão do Voto às Cegas tem 15 projetos de lei (PL) apresentados na Câmara dos Deputados. Projeto de lei é uma proposta de lei nova ou de mudança numa lei que já existe, ainda em discussão.",
      "Os projetos vêm dos Dados Abertos da Câmara, o serviço público onde a própria Câmara divulga suas informações. Entram os mais recentes, na ordem em que foram cadastrados.",
    ],
  },
  {
    titulo: "Por que esse critério",
    texto: [
      "É um critério mecânico: ninguém da equipe escolhe a dedo quais projetos aparecem. Assim o politiQ não seleciona temas, autores ou partidos.",
      "O texto mostrado é a ementa oficial, o resumo que a própria Câmara escreve para cada projeto.",
    ],
  },
  {
    titulo: "O que fica escondido e por quê",
    texto: [
      "Autor e partido só aparecem depois da sua decisão. Eles nem chegam ao seu aparelho antes disso, para que a decisão seja sobre a ideia, e não sobre quem a propôs.",
      "O partido mostrado é o partido atual do autor, segundo a Câmara. Ele pode ser diferente do partido que a pessoa tinha quando apresentou o projeto.",
    ],
  },
  {
    titulo: "O que o politiQ guarda",
    texto: [
      "Só que você tomou uma decisão sobre aquela lei, para ela não voltar. Se você aprovou ou rejeitou nunca é gravado, em lugar nenhum.",
      "Pular não conta: a lei volta no fim da sessão.",
    ],
  },
  {
    titulo: "Quando a Câmara não responde",
    texto: [
      "Se o serviço da Câmara estiver fora do ar, o app mostra leis de exemplo, com autores e partidos fictícios, sempre marcadas como exemplo ilustrativo.",
    ],
  },
];

export default function Criterio() {
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Manchete sobretitulo="Voto às Cegas" linha1="Como as leis" linha2="são escolhidas" tamanho="media" />
        <section className="flex flex-col gap-4 px-5 pt-6">
          {blocos.map((b) => (
            <Janela key={b.titulo} rotulo={b.titulo}>
              <div className="flex max-w-[60ch] flex-col gap-3 px-5 py-4 text-[15px] leading-[1.55]">
                {b.texto.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            </Janela>
          ))}
        </section>
        <div className="px-5 pt-4">
          <LinkSecundario href="/voto">Ir pro Voto às Cegas</LinkSecundario>
        </div>
      </main>
    </Tela>
  );
}
