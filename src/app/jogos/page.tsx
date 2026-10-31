import { Icone } from "@/components/icones";
import { BotaoPrincipal, Cabecalho, Cartao, Etiqueta, FotoRasgada, Tela, Titulo } from "@/components/ui";
import fotoBandeira from "@/assets/fotos/bandeira.jpg";

type Jogo = { nome: string; descricao: string; estado: "liberada" | "em-breve" | "bloqueada"; href?: string };

const jogos: Jogo[] = [
  { nome: "Voto às Cegas", descricao: "Julgue projetos de lei sem saber quem propôs.", estado: "liberada", href: "/voto" },
  { nome: "Auditor de Contradições", descricao: "Compare o discurso público com o voto registrado.", estado: "em-breve" },
  { nome: "Cadeira do Gestor", descricao: "Monte um orçamento e veja as escolhas por trás dele.", estado: "bloqueada" },
  { nome: "Raio-X Tributário", descricao: "Veja quanto do seu trabalho vira imposto.", estado: "bloqueada" },
  { nome: "Radar Anti-Fake News", descricao: "Treine a reconhecer desinformação antes de compartilhar.", estado: "bloqueada" },
];

export default function Jogos() {
  const liberadas = jogos.filter((f) => f.estado === "liberada").length;
  // o jogo liberado ganha o card com foto; a lista mostra o que vem depois
  const proximos = jogos.filter((f) => f.estado !== "liberada");
  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        <Titulo rotulo="Cada módulo libera um novo" titulo="Seus " destaque="jogos" />
        <section className="px-5 pt-5" aria-label="Pra jogar agora">
          <Cartao className="px-2 pt-2 pb-4">
            <FotoRasgada
              src={fotoBandeira}
              alt="Bandeira do Brasil hasteada contra o céu"
              className="h-36"
              semente={17}
              posicao="center 38%"
            >
              <Etiqueta className="absolute -bottom-2 left-2">Liberado</Etiqueta>
            </FotoRasgada>
            <div className="px-2">
              <h2 className="t-titulo mt-5">Voto às Cegas</h2>
              <p className="mt-1.5 text-sm leading-[1.4] text-suave">
                Leia um projeto de lei de verdade, aprove ou rejeite, e só depois descubra quem propôs.
              </p>
              <BotaoPrincipal href="/voto" className="mt-4 w-full">
                Jogar agora
                <Icone nome="seta" tamanho={18} />
              </BotaoPrincipal>
            </div>
          </Cartao>
        </section>
        <section className="px-5 pt-5" aria-label="Próximos jogos">
          <Cartao rotulo="Próximos jogos" etiqueta={`${liberadas} de ${jogos.length} liberado${liberadas > 1 ? "s" : ""}`}>
            <ul className="pt-1">
              {proximos.map((f, i) => {
                const ultima = i === proximos.length - 1;
                const linha = `flex min-h-[84px] items-center gap-4 px-5 py-4 ${ultima ? "rounded-b-2xl" : "border-b border-linha"}`;
                const textos = (
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="t-subtitulo text-suave">{f.nome}</span>
                    <span className="text-sm leading-snug text-suave">{f.descricao}</span>
                  </span>
                );
                return (
                  <li key={f.nome} className={linha}>
                    {textos}
                    <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-suave">
                      {f.estado === "bloqueada" && <Icone nome="cadeado" tamanho={16} />}
                      {f.estado === "em-breve" ? "Em breve" : "Bloqueado"}
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
