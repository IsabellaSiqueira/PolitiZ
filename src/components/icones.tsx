type Props = { nome: Nome; tamanho?: number; className?: string };
export type Nome = "trilhas" | "voto" | "ferramentas" | "perfil" | "cadeado" | "olho" | "certo" | "errado" | "seta" | "voltar";

const caminhos: Record<Nome, React.ReactNode> = {
  trilhas: (
    <>
      <circle cx="4.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9 6h11M9 12h11M9 18h11" />
    </>
  ),
  voto: <path d="M3.5 11.5h17v8.5h-17zM8 11.5V4h8v7.5M10.5 7.5h3" />,
  ferramentas: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-.6-.6-2.6z" />,
  perfil: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  olho: (
    <>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  certo: <path d="M5 12.5l4.5 4.5L19 7" strokeWidth={2.8} />,
  errado: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeWidth={2.8} />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  voltar: <path d="M19 12H5M11 6l-6 6 6 6" />,
};

export function Icone({ nome, tamanho = 22, className }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {caminhos[nome]}
    </svg>
  );
}
