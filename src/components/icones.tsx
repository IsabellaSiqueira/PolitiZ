type Props = { nome: Nome; tamanho?: number; className?: string };
export type Nome =
  | "inicio"
  | "trilhas"
  | "voto"
  | "ferramentas"
  | "perfil"
  | "cadeado"
  | "certo"
  | "errado"
  | "seta"
  | "voltar"
  | "externo";

// traço fino e arredondado, como os ícones da barra de abas do manual
const caminhos: Record<Nome, React.ReactNode> = {
  inicio: <path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />,
  trilhas: <path d="M12 6.5C10 5 7 4.5 3.5 5v13.5c3.5-.5 6.5 0 8.5 1.5m0-13.5c2-1.5 5-2 8.5-1.5v13.5c-3.5-.5-6.5 0-8.5 1.5m0-13.5V20" />,
  voto: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ferramentas: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-.6-.6-2.6z" />,
  perfil: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c0-3.8 3.4-5.5 7.5-5.5s7.5 1.7 7.5 5.5" />
    </>
  ),
  cadeado: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  certo: <path d="M5 12.5l4.5 4.5L19 7" strokeWidth={2.4} />,
  errado: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeWidth={2.4} />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  voltar: <path d="M19 12H5M11 6l-6 6 6 6" />,
  externo: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
};

export function Icone({ nome, tamanho = 22, className }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {caminhos[nome]}
    </svg>
  );
}
