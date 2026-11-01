import Link from "next/link";
import { TelaPasso } from "@/components/entrada";
import { Icone } from "@/components/icones";

/** Tela A6: com código da turma ou por conta própria (plano gratuito). */
export default function ComoVaiUsar() {
  const opcoes = [
    { href: "/turma", titulo: "Tenho um código de turma", texto: "Seu professor passou um código de 8 letras e números." },
    { href: "/boas-vindas", titulo: "Vou estudar por conta própria", texto: "Plano gratuito: 5 aulas novas e 5 decisões no Voto às Cegas por dia." },
  ];
  return (
    <TelaPasso titulo="Como vai usar" voltar="/termos-e-privacidade">
      <h1 className="t-titulo pt-4">Como você vai usar o politiQ?</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {opcoes.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="toque flex min-h-[88px] items-center gap-4 rounded-2xl border-[1.5px] border-tinta px-4 py-4 active:bg-claro">
              <span className="flex-1">
                <span className="block text-base font-bold">{o.titulo}</span>
                <span className="mt-0.5 block text-[15px] leading-snug text-suave">{o.texto}</span>
              </span>
              <Icone nome="seta" tamanho={20} />
            </Link>
          </li>
        ))}
      </ul>
    </TelaPasso>
  );
}
