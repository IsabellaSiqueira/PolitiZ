import type { Metadata } from "next";
import { Cabecalho, LinkTexto, Tela, Titulo } from "@/components/ui";

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
        <Titulo rotulo="Voto às Cegas" titulo="Como as leis são " destaque="escolhidas" />
        <div className="flex flex-col gap-7 px-5 pt-6">
          {blocos.map((b) => (
            <section key={b.titulo} className="flex max-w-[60ch] flex-col gap-2">
              <h2 className="t-subtitulo">{b.titulo}</h2>
              {b.texto.map((t, i) => (
                <p key={i} className="t-corpo">
                  {t}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="px-5 pt-6">
          <LinkTexto href="/voto" azul>
            Ir pro Voto às Cegas
          </LinkTexto>
        </div>
      </main>
    </Tela>
  );
}
