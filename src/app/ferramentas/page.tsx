import Link from "next/link";
import { Icone } from "@/components/icones";
import { Cabecalho, Cartao, Tela, Titulo } from "@/components/ui";

type Ferramenta = { nome: string; descricao: string; estado: "liberada" | "em-breve" | "bloqueada"; href?: string };

const ferramentas: Ferramenta[] = [
  { nome: "Voto às Cegas", descricao: "Julgue projetos de lei sem saber quem propôs.", estado: "liberada", href: "/voto" },
  { nome: "Auditor de Contradições", descricao: "Compare o discurso público com o voto registrado.", estado: "em-breve" },
  { nome: "Cadeira do Gestor", descricao: "Monte um orçamento e veja as escolhas por trás dele.", estado: "bloqueada" },
  { nome: "Raio-X Tributário", descricao: "Veja quanto do seu trabalho vira imposto.", estado: "bloqueada" },
  { nome: "Radar Anti-Fake News", descricao: "Treine a reconhecer desinformação antes de compartilhar.", estado: "bloqueada" },
];

export default function Ferramentas() {
  const liberadas = ferramentas.filter((f) => f.estado === "liberada").length;
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo rotulo="Cada módulo libera uma nova" titulo="Suas " destaque="ferramentas" />
        <section className="px-5 pt-5" aria-label="Ferramentas">
          <Cartao rotulo="Caixa de ferramentas" etiqueta={`${liberadas} liberada${liberadas > 1 ? "s" : ""}`}>
            <ul className="pt-1">
              {ferramentas.map((f, i) => {
                const ultima = i === ferramentas.length - 1;
                const linha = `flex min-h-[84px] items-center gap-4 px-5 py-4 ${ultima ? "rounded-b-2xl" : "border-b border-linha"}`;
                const textos = (
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className={`t-subtitulo ${f.estado === "liberada" ? "" : "text-suave"}`}>{f.nome}</span>
                    <span className="text-sm leading-snug text-suave">{f.descricao}</span>
                  </span>
                );
                if (f.estado === "liberada" && f.href) {
                  return (
                    <li key={f.nome}>
                      <Link href={f.href} className={`${linha} active:bg-claro`}>
                        {textos}
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-tinta">
                          <Icone nome="seta" tamanho={20} />
                        </span>
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={f.nome} className={linha}>
                    {textos}
                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-suave">
                      {f.estado === "bloqueada" && <Icone nome="cadeado" tamanho={16} />}
                      {f.estado === "em-breve" ? "Em breve" : "Bloqueada"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Cartao>
        </section>
      </main>
    </Tela>
  );
}
