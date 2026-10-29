import Link from "next/link";
import { Icone } from "@/components/icones";
import { Cabecalho, Janela, Manchete, Tela } from "@/components/ui";

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
        <Manchete
          sobretitulo="Cada módulo libera uma nova"
          linha1="Suas"
          linha2="ferramentas"
          tamanho="media"
        />
        <section className="px-5 pt-[22px]" aria-label="Ferramentas">
          <Janela rotulo="Caixa de ferramentas" etiqueta={`${liberadas} liberada${liberadas > 1 ? "s" : ""}`} pilha>
            <ul>
              {ferramentas.map((f, i) => {
                const ultima = i === ferramentas.length - 1;
                const linha = `flex min-h-[84px] items-center gap-4 px-5 py-4 ${ultima ? "" : "border-b-[1.5px] border-tinta/15"}`;
                const textos = (
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className={`text-lg leading-tight font-bold ${f.estado === "liberada" ? "" : "text-tinta-suave"}`}>{f.nome}</span>
                    <span className="text-sm leading-snug text-tinta-suave">{f.descricao}</span>
                  </span>
                );
                if (f.estado === "liberada" && f.href) {
                  return (
                    <li key={f.nome}>
                      <Link href={f.href} className={`${linha} active:bg-amarelo/30`}>
                        {textos}
                        <span className="btn-acao flex size-11 shrink-0 items-center justify-center rounded-[4px] bg-amarelo">
                          <Icone nome="seta" />
                        </span>
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={f.nome} className={linha}>
                    {textos}
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-tinta-suave">
                      {f.estado === "bloqueada" && <Icone nome="cadeado" tamanho={16} />}
                      {f.estado === "em-breve" ? "Em breve" : "Bloqueada"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Janela>
        </section>
      </main>
    </Tela>
  );
}
