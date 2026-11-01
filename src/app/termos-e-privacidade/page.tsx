"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { AvisoErro, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, LinkTexto } from "@/components/ui";
import { Icone } from "@/components/icones";

const COMBINADOS = [
  { titulo: "Seu voto nunca é salvo", texto: "No Voto às Cegas, guardamos só que você decidiu, nunca o que decidiu." },
  { titulo: "Só o necessário", texto: "Nome, e-mail e seu progresso nas aulas. Nada além disso." },
  { titulo: "Sem anúncio e sem rastreador", texto: "Nenhuma empresa de fora acompanha o que você faz aqui." },
  { titulo: "Seus dados são seus", texto: "Você pode apagar tudo quando quiser." },
];

/** Tela A5: os combinados em linguagem simples e o aceite dos termos. */
export default function TermosEPrivacidade() {
  const router = useRouter();
  const { recarregar } = useConta();
  const id = useId();
  const [aceito, setAceito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    setErro(null);
    try {
      await dados.aceitarTermos(await dados.versaoTermos());
      await recarregar();
      router.push("/como-vai-usar");
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  };

  return (
    <TelaPasso
      titulo="Termos e privacidade"
      voltar="/criar-conta"
      aoEnviar={enviar}
      rodape={
        <BotaoPrincipal type="submit" disabled={!aceito} className="w-full">
          Aceitar e continuar
          <Icone nome="seta" tamanho={20} />
        </BotaoPrincipal>
      }
    >
      <h1 className="t-titulo pt-4">Antes de começar, o combinado</h1>
      <ul className="mt-5 flex flex-col gap-3">
        {COMBINADOS.map((c) => (
          <li key={c.titulo} className="rounded-2xl border-[1.5px] border-linha px-4 py-3.5">
            <p className="text-base font-bold">{c.titulo}</p>
            <p className="mt-0.5 text-[15px] leading-snug text-suave">{c.texto}</p>
          </li>
        ))}
      </ul>
      <label htmlFor={id} className="mt-5 flex min-h-12 cursor-pointer items-start gap-3">
        <input id={id} type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)} className="mt-0.5 size-6 shrink-0 accent-azul" />
        <span className="text-[15px] leading-snug">Li e aceito os Termos de uso e a Política de privacidade.</span>
      </label>
      <div className="flex flex-wrap gap-x-4">
        <LinkTexto href="/termos" azul>
          Ler os Termos de uso
        </LinkTexto>
        <LinkTexto href="/privacidade" azul>
          Ler a Política de privacidade
        </LinkTexto>
      </div>
      <AvisoErro>{erro}</AvisoErro>
    </TelaPasso>
  );
}
