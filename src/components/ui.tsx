"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icone, type Nome } from "./icones";

/* ---------- Estrutura de tela ---------- */

export function Tela({ children, comNavegacao = true }: { children: React.ReactNode; comNavegacao?: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-clip bg-azul">
      {children}
      {comNavegacao && <Navegacao />}
    </div>
  );
}

export function Cabecalho() {
  return (
    <header className="flex items-center justify-between border-b-[1.5px] border-tinta bg-papel px-5 pt-[max(14px,env(safe-area-inset-top))] pb-3">
      <Link href="/" className="flex min-h-11 items-center font-sans text-2xl font-black tracking-[-0.03em] text-tinta">
        politiQ
      </Link>
    </header>
  );
}

export function CabecalhoTarefa({ contexto }: { contexto: string }) {
  return (
    <header className="flex items-center justify-between border-b-[1.5px] border-tinta bg-papel px-3 pt-[max(8px,env(safe-area-inset-top))] pb-1">
      <Link href="/" className="flex min-h-11 items-center gap-1.5 px-2 font-bold text-azul underline underline-offset-4">
        <Icone nome="voltar" tamanho={18} />
        Sair
      </Link>
      <span className="px-2 font-mono text-xs font-semibold uppercase tracking-[0.06em] text-tinta">{contexto}</span>
    </header>
  );
}

const abas: { href: string; nome: string; icone: Nome }[] = [
  { href: "/", nome: "Trilhas", icone: "trilhas" },
  { href: "/voto", nome: "Voto", icone: "voto" },
  { href: "/ferramentas", nome: "Ferramentas", icone: "ferramentas" },
  { href: "/perfil", nome: "Perfil", icone: "perfil" },
];

export function Navegacao() {
  const rota = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t-[1.5px] border-tinta bg-papel px-2 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      <ul className="flex justify-between">
        {abas.map((a) => {
          const ativa = a.href === "/" ? rota === "/" || rota.startsWith("/quiz") : rota.startsWith(a.href);
          return (
            <li key={a.href} className="flex-1">
              <Link
                href={a.href}
                aria-current={ativa ? "page" : undefined}
                className={`mx-auto flex h-[54px] max-w-[88px] flex-col items-center justify-center gap-[3px] rounded-lg text-xs ${
                  ativa ? "border-[1.5px] border-tinta bg-limao font-black text-tinta" : "font-semibold text-tinta-suave"
                }`}
              >
                <Icone nome={a.icone} />
                {a.nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ---------- Manchete: sobretítulo + título em duas vozes + numeral vazado ---------- */

export function Manchete({
  sobretitulo,
  linha1,
  linha2,
  numeral,
  numeralRotulo,
  tamanho = "grande",
}: {
  sobretitulo: string;
  linha1: string;
  linha2?: string;
  numeral?: string;
  numeralRotulo?: string;
  tamanho?: "grande" | "media";
}) {
  // escala com a largura da tela: 52px em 390, menor em telas estreitas
  const t = tamanho === "grande" ? "text-[clamp(40px,13.3vw,52px)]" : "text-[clamp(32px,10.3vw,40px)]";
  return (
    <div className="px-5 pt-5">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-amarelo" aria-live="polite">
        {sobretitulo}
      </p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <h1 className={`-ml-[3px] ${t} leading-[0.9] font-black uppercase tracking-[-0.04em]`}>
          <span className="block text-papel">{linha1}</span>
          {linha2 && <span className="block text-amarelo">{linha2}</span>}
        </h1>
        {numeral && (
          <div className="shrink-0 text-right" aria-hidden="true">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-papel">{numeralRotulo}</p>
            <p className="numeral-vazado text-[clamp(56px,19vw,74px)] leading-[0.8] font-black tracking-[-0.05em]">{numeral}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Regua({ total, feitos, atual, rotulo }: { total: number; feitos: number; atual?: number; rotulo: string }) {
  return (
    <div className="flex gap-[3px] px-5 pt-3.5" role="img" aria-label={rotulo}>
      {Array.from({ length: total }, (_, i) => {
        const estilo =
          i === atual ? "bg-amarelo" : i < feitos ? "bg-papel" : "border border-papel/75";
        return <span key={i} className={`h-1.5 flex-1 ${estilo}`} />;
      })}
    </div>
  );
}

/* ---------- Janela do documento ---------- */

export function Janela({
  rotulo,
  etiqueta,
  children,
  pilha = false,
}: {
  rotulo: string;
  etiqueta?: string;
  children: React.ReactNode;
  pilha?: boolean;
}) {
  return (
    <div className={`relative ${pilha ? "mr-2.5 mb-2.5" : ""}`}>
      {pilha && (
        <>
          <div aria-hidden="true" className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-[3px] border-[1.5px] border-tinta bg-papel" />
          <div aria-hidden="true" className="absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-[3px] border-[1.5px] border-tinta bg-papel" />
        </>
      )}
      <article className="relative overflow-hidden rounded-[3px] border-2 border-tinta bg-papel">
        <div className="flex items-center justify-between border-b-[1.5px] border-tinta bg-rosa py-2 pr-3 pl-5">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.04em]">{rotulo}</span>
          {etiqueta && (
            <span className="rounded-[2px] border border-tinta bg-papel px-[7px] py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em]">
              {etiqueta}
            </span>
          )}
        </div>
        {children}
      </article>
    </div>
  );
}

/* ---------- Botão de ação (amarelo, afunda ao pressionar) ---------- */

type BotaoProps = { children: React.ReactNode; className?: string; id?: string } & (
  | { href: string; onClick?: never; type?: never; disabled?: never }
  | { href?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }
);

export function BotaoAcao({ children, className = "", id, ...p }: BotaoProps) {
  const base = `btn-acao flex min-h-14 items-center justify-center gap-2 rounded-[4px] bg-amarelo px-4 text-[17px] font-black uppercase tracking-[0.03em] text-tinta disabled:cursor-not-allowed disabled:opacity-50 ${className}`;
  if ("href" in p && p.href) return <Link id={id} href={p.href} className={base}>{children}</Link>;
  return (
    <button id={id} type={p.type ?? "button"} onClick={p.onClick} disabled={p.disabled} className={base}>
      {children}
    </button>
  );
}

export function LinkSecundario({ href, onClick, children }: { href?: string; onClick?: () => void; children: React.ReactNode }) {
  const cls = "mx-auto flex min-h-11 items-center justify-center gap-1.5 px-3 text-sm font-bold text-papel underline underline-offset-4";
  const conteudo = (
    <>
      {children}
      <Icone nome="seta" tamanho={16} />
    </>
  );
  if (href) return <Link href={href} className={cls}>{conteudo}</Link>;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {conteudo}
    </button>
  );
}

/* ---------- Selo do voto ---------- */

export function Selo({ voto, className = "" }: { voto: "aprovo" | "rejeito"; className?: string }) {
  const aprovou = voto === "aprovo";
  return (
    <div
      role="status"
      className={`anim-carimbo pointer-events-none flex size-28 flex-col items-center justify-center rounded-full border-2 border-tinta bg-limao ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-2 rounded-full border border-dashed border-tinta" />
      <Icone nome={aprovou ? "certo" : "errado"} tamanho={18} />
      <span className="mt-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em]">Você</span>
      <span className="text-xs leading-none font-black uppercase tracking-[0.02em]">{aprovou ? "Aprovou" : "Rejeitou"}</span>
    </div>
  );
}

export function AvisoExemplo() {
  return <p className="font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-tinta-suave">Exemplo ilustrativo</p>;
}
