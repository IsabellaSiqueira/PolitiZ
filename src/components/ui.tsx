"use client";

import { useEffect, useId, useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import papelAzul from "@/assets/colagem/papel-azul.png";
import papelAmarelo from "@/assets/colagem/papel-amarelo.png";
import rabiscoAzul from "@/assets/colagem/rabisco-azul.png";
import rabiscoPreto from "@/assets/colagem/rabisco-preto.png";
import coroa from "@/assets/colagem/coroa.png";
import { usePathname } from "next/navigation";
import { Icone, type Nome } from "./icones";
import { BotaoGlossario } from "./glossario";

/* ---------- Estrutura de tela ---------- */

export function Tela({ children, comNavegacao = true }: { children: React.ReactNode; comNavegacao?: boolean }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-x-clip bg-branco">
      {children}
      {comNavegacao && <Navegacao />}
    </div>
  );
}

/** O nome é sempre politiQ: p minúsculo, sem acento, Q maiúsculo em azul. */
export function Logo({ className = "text-[22px]" }: { className?: string }) {
  return (
    <span className={`font-extrabold leading-none tracking-[-0.05em] text-tinta ${className}`}>
      politi<span className="text-azul">Q</span>
    </span>
  );
}

export function Cabecalho({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between px-5 pt-[max(12px,env(safe-area-inset-top))] pb-1">
      <Link href="/" aria-label="politiQ, início" className="flex min-h-11 items-center">
        <Logo />
      </Link>
      {children}
    </header>
  );
}

/** Cabeçalho de tarefa (aula, quiz): voltar à esquerda, onde a pessoa está à direita. */
export function CabecalhoTarefa({ contexto, voltar = "/trilhas", glossario = true }: { contexto: string; voltar?: string; glossario?: boolean }) {
  return (
    <header className="flex items-center justify-between px-3 pt-[max(8px,env(safe-area-inset-top))] pb-1">
      <Link href={voltar} className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-tinta">
        <Icone nome="voltar" tamanho={22} />
        <span className="sr-only">Sair</span>
      </Link>
      <span className="flex items-center gap-1">
        <span className="px-2 text-[13px] font-semibold text-tinta">{contexto}</span>
        {glossario && <BotaoGlossario />}
      </span>
    </header>
  );
}

const abas: { href: string; nome: string; icone: Nome }[] = [
  { href: "/", nome: "Início", icone: "inicio" },
  { href: "/trilhas", nome: "Trilhas", icone: "trilhas" },
  { href: "/voto", nome: "Voto às Cegas", icone: "voto" },
  { href: "/jogos", nome: "Jogos", icone: "jogos" },
  { href: "/perfil", nome: "Perfil", icone: "perfil" },
];

export function Navegacao() {
  const rota = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t border-linha bg-branco px-1 pt-1.5 pb-[max(10px,env(safe-area-inset-bottom))]"
    >
      <ul className="flex justify-between">
        {abas.map((a) => {
          const ativa =
            a.href === "/"
              ? rota === "/"
              : a.href === "/trilhas"
                ? ["/trilhas", "/aula", "/quiz", "/glossario", "/entrada"].some((r) => rota.startsWith(r))
                : rota.startsWith(a.href);
          return (
            <li key={a.href} className="flex-1">
              <Link
                href={a.href}
                aria-current={ativa ? "page" : undefined}
                className={`mx-auto flex h-[54px] flex-col items-center justify-center gap-1 rounded-xl text-center text-[10.5px] leading-tight ${
                  ativa ? "font-bold text-azul" : "font-medium text-suave"
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

/* ---------- Títulos ---------- */

/**
 * Rótulo azul em maiúsculas + título ExtraBold.
 * `destaque` é a parte do título em azul (ex.: "Oi, " + "Isa!").
 */
export function Titulo({
  rotulo,
  titulo,
  destaque,
  apoio,
  display = false,
}: {
  rotulo?: string;
  titulo: string;
  destaque?: string;
  apoio?: React.ReactNode;
  display?: boolean;
}) {
  return (
    <div className="px-5 pt-4">
      {rotulo && (
        <p className="t-rotulo mb-2 text-azul" aria-live="polite">
          {rotulo}
        </p>
      )}
      <h1 className={display ? "t-display" : "t-titulo"}>
        {titulo}
        {destaque && <span className="text-azul">{destaque}</span>}
      </h1>
      {apoio && <p className="mt-2 max-w-[36ch] text-[15px] leading-[1.5] font-medium">{apoio}</p>}
    </div>
  );
}

export function Regua({ total, feitos, atual, rotulo }: { total: number; feitos: number; atual?: number; rotulo: string }) {
  return (
    <div className="flex gap-1 px-5 pt-3" role="img" aria-label={rotulo}>
      {Array.from({ length: total }, (_, i) => {
        const estilo = i === atual ? "bg-tinta" : i < feitos ? "bg-azul" : "bg-linha";
        return <span key={i} className={`h-1.5 flex-1 rounded-full ${estilo}`} />;
      })}
    </div>
  );
}

/* ---------- Cartão: contorno fino, cantos bem arredondados ---------- */

export function Cartao({
  rotulo,
  etiqueta,
  children,
  className = "",
}: {
  rotulo?: string;
  etiqueta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`relative rounded-2xl border-[1.5px] border-linha bg-branco ${className}`}>
      {(rotulo || etiqueta) && (
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          {rotulo && <span className="t-rotulo text-suave">{rotulo}</span>}
          {etiqueta && <span className="text-[13px] font-semibold text-suave">{etiqueta}</span>}
        </div>
      )}
      {children}
    </article>
  );
}

/* ---------- Botões ---------- */

type BotaoProps = { children: React.ReactNode; className?: string; id?: string } & (
  | { href: string; onClick?: never; type?: never; disabled?: never }
  | { href?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }
);

function botao(base: string, { children, className = "", id, ...p }: BotaoProps) {
  const cls = `toque flex min-h-14 items-center justify-center gap-2.5 rounded-full px-6 text-base font-bold text-tinta disabled:cursor-not-allowed disabled:opacity-50 ${base} ${className}`;
  if ("href" in p && p.href) return <Link id={id} href={p.href} className={cls}>{children}</Link>;
  return (
    <button id={id} type={p.type ?? "button"} onClick={p.onClick} disabled={p.disabled} className={cls}>
      {children}
    </button>
  );
}

/** Amarelo, texto preto, seta. Um por tela, para a ação mais importante. */
export function BotaoPrincipal(p: BotaoProps) {
  return botao("bg-amarelo active:bg-[#f2c71f]", p);
}

/** Contorno preto, fundo branco. */
export function BotaoSecundario(p: BotaoProps) {
  return botao("border-[1.5px] border-tinta bg-branco active:bg-claro", p);
}

/** Ação de texto, sublinhada. `azul` para links que levam para fora ou para outra página. */
export function LinkTexto({
  href,
  onClick,
  children,
  azul = false,
  externo = false,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  azul?: boolean;
  externo?: boolean;
}) {
  const cls = `inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 text-[15px] font-semibold underline underline-offset-4 ${azul ? "text-azul" : "text-tinta"}`;
  if (href && externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        <Icone nome="externo" tamanho={16} />
        <span className="sr-only">(abre em outra aba)</span>
      </a>
    );
  }
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ---------- Elementos gráficos ---------- */

/** Chamadas curtas e temas. Maiúsculas, inclinada 2 graus. */
export function Etiqueta({ children, cor = "amarelo", className = "" }: { children: React.ReactNode; cor?: "amarelo" | "azul"; className?: string }) {
  return (
    <span
      className={`inline-block rotate-2 px-2 pt-1 pb-[5px] text-[11px] leading-none font-extrabold uppercase tracking-[0.04em] ${
        cor === "azul" ? "bg-azul text-branco" : "bg-amarelo text-tinta"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** Destaca uma palavra ou um número. Uma vez por tela. */
export function MarcaTexto({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span aria-hidden="true" className="absolute inset-x-[-3px] bottom-[0.08em] h-[0.45em] rotate-1 bg-amarelo" />
      <span className="relative">{children}</span>
    </span>
  );
}

/**
 * Carimbo da revelação no Voto às Cegas.
 * Aprovar e rejeitar pesam igual: mesmo tamanho, mesma cor, mesmo lugar.
 */
export function Carimbo({ voto, className = "" }: { voto: "aprovo" | "rejeito"; className?: string }) {
  return (
    <div
      role="status"
      className={`anim-carimbo pointer-events-none flex size-24 rotate-12 flex-col items-center justify-center rounded-full border-[3px] border-azul bg-branco text-center ${className}`}
    >
      <span className="t-anotacao text-[15px] leading-[1.05]">você</span>
      <span className="t-anotacao text-[15px] leading-[1.05]">{voto === "aprovo" ? "aprovou" : "rejeitou"}</span>
    </div>
  );
}

/* ---------- Colagem: foto documental com borda rasgada e peças por cima ---------- */

/**
 * Foto em preto e branco, granulada, com a borda rasgada do manual (máscara exportada do Figma).
 * Só em abertura, capas e cards de jogos; nunca em aulas, formulários ou perguntas do quiz.
 * As fotos já são tratadas (preto e branco e granulação) em src/assets/fotos.
 */
export function FotoRasgada({
  src,
  alt,
  className = "h-40",
  posicao = "center",
  preload = false,
  children,
}: {
  src: StaticImageData;
  alt: string;
  className?: string;
  posicao?: string;
  preload?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <figure className={`relative ${className}`}>
      <div className="absolute inset-0 drop-shadow-[0_2px_3px_rgb(0_0_0/0.22)]">
        <div className="absolute inset-0 [mask-image:url(/colagem/mascara-foto.png)] [mask-size:100%_100%] [mask-repeat:no-repeat]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            preload={preload}
            placeholder="blur"
            className="object-cover"
            style={{ objectPosition: posicao }}
          />
        </div>
      </div>
      {children}
    </figure>
  );
}

const pecas = { "papel-azul": papelAzul, "papel-amarelo": papelAmarelo, "rabisco-azul": rabiscoAzul, "rabisco-preto": rabiscoPreto, coroa };

/**
 * Peça de colagem do manual, só decorativa. Use no máximo três na mesma composição.
 * Rabiscos sempre num canto, nunca sobre texto; coroa para cargos e poder.
 */
export function Peca({ nome, className }: { nome: keyof typeof pecas; className: string }) {
  return <Image src={pecas[nome]} alt="" aria-hidden="true" className={`pointer-events-none absolute h-auto select-none ${className}`} />;
}

/* ---------- Formulário ---------- */

/** Rótulo em cima, borda fina, foco em azul; com erro, borda vermelha e a mensagem embaixo (tela A15). */
export function Campo({
  rotulo,
  ajuda,
  erro,
  ...input
}: { rotulo: string; ajuda?: string; erro?: string | null } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">) {
  const id = useId();
  const descricao = [ajuda && `${id}-ajuda`, erro && `${id}-erro`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {rotulo}
      </label>
      <input
        id={id}
        aria-describedby={descricao}
        aria-invalid={erro ? true : undefined}
        className={`h-[52px] rounded-[14px] border-[1.5px] bg-branco px-3.5 text-[15px] placeholder:text-suave focus-visible:outline-none ${
          erro ? "border-erro focus:shadow-[0_0_0_1px_var(--color-erro)]" : "border-linha focus:border-azul focus:shadow-[0_0_0_1px_var(--color-azul)]"
        }`}
        {...input}
      />
      {ajuda && (
        <p id={`${id}-ajuda`} className="text-[13px] text-suave">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={`${id}-erro`} className="flex items-start gap-1.5 text-[13px] font-semibold text-erro">
          <Icone nome="errado" tamanho={16} className="mt-px shrink-0" />
          {erro}
        </p>
      )}
    </div>
  );
}

export type EstadoOpcao = "padrao" | "selecionada" | "correta" | "errada";

/** Alternativa do quiz. A cor nunca vem sozinha: certa e errada também têm ícone e texto. */
export function OpcaoQuiz({
  letra,
  texto,
  estado = "padrao",
  onClick,
  disabled,
}: {
  letra: string;
  texto: string;
  estado?: EstadoOpcao;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const caixa = {
    padrao: "border border-linha bg-branco",
    selecionada: "border-[1.5px] border-tinta bg-amarelo",
    correta: "border-[1.5px] border-azul bg-azul text-branco",
    errada: "border-2 border-erro bg-branco",
  }[estado];
  const bolinha = {
    padrao: "border border-linha",
    selecionada: "border-[1.5px] border-tinta",
    correta: "",
    errada: "border-[1.5px] border-erro",
  }[estado];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={estado !== "padrao"}
      className={`toque flex min-h-[58px] w-full items-center gap-3 rounded-[14px] py-3 pr-4 pl-3 text-left transition-colors duration-200 disabled:cursor-default disabled:active:scale-100 ${caixa}`}
    >
      <span className={`flex size-[30px] shrink-0 items-center justify-center rounded-full bg-branco text-[13px] font-bold text-tinta ${bolinha}`}>
        {letra}
      </span>
      <span className="flex-1 text-[15px] leading-[1.3] font-medium">{texto}</span>
      {estado === "selecionada" && (
        <span aria-hidden="true" className="flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-tinta">
          <span className="size-2 rounded-full bg-tinta" />
        </span>
      )}
      {estado === "correta" && (
        <span className="flex items-center gap-1">
          <Icone nome="certo" tamanho={20} />
          <span className="sr-only">Correta</span>
        </span>
      )}
      {estado === "errada" && (
        <span className="flex items-center gap-1 text-erro">
          <Icone nome="errado" tamanho={20} />
          <span className="sr-only">Sua resposta, errada</span>
        </span>
      )}
    </button>
  );
}

export function AvisoExemplo() {
  return <p className="text-xs text-suave">Exemplo ilustrativo</p>;
}

/* ---------- Gaveta (sobe do rodapé e escurece o fundo, como no protótipo) ---------- */

/** Diálogo nativo: prende o foco, fecha com Esc e devolve o foco para quem abriu. */
export function Gaveta({
  aberta,
  aoFechar,
  titulo,
  children,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) d.showModal();
    if (!aberta && d.open) d.close();
  }, [aberta]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      className="mx-auto mt-auto mb-0 w-full max-w-[430px] rounded-t-3xl bg-branco p-0 text-tinta backdrop:bg-tinta/40"
    >
      <div className="px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-linha" />
        <h2 id={id} className="t-subtitulo">
          {titulo}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
