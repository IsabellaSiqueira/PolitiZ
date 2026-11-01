"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { AvisoErro, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, Campo } from "@/components/ui";
import { Icone } from "@/components/icones";

/** Tela A16: nova senha, com as regras marcadas conforme são cumpridas. */
export default function NovaSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [repetida, setRepetida] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const regras = [
    { texto: "Pelo menos 8 caracteres", ok: senha.length >= 8 },
    { texto: "As duas senhas são iguais", ok: senha.length > 0 && senha === repetida },
  ];

  const enviar = async () => {
    setErro(null);
    if (!regras.every((r) => r.ok)) return setErro("Confira as regras da senha.");
    try {
      await dados.definirNovaSenha(senha);
      router.push("/entrar");
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  };

  return (
    <TelaPasso
      titulo="Nova senha"
      voltar="/entrar"
      aoEnviar={enviar}
      rodape={
        <BotaoPrincipal type="submit" className="w-full">
          Salvar senha
        </BotaoPrincipal>
      }
    >
      <h1 className="t-titulo pt-4">Crie uma senha nova</h1>
      <div className="mt-6 flex flex-col gap-4">
        <Campo rotulo="Senha nova" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <Campo rotulo="Repita a senha" type="password" autoComplete="new-password" value={repetida} onChange={(e) => setRepetida(e.target.value)} />
      </div>
      <ul className="mt-4 flex flex-col gap-1.5" aria-label="Regras da senha">
        {regras.map((r) => (
          <li key={r.texto} className={`flex items-center gap-2 text-[15px] ${r.ok ? "text-azul" : "text-suave"}`}>
            <Icone nome={r.ok ? "certo" : "cadeado"} tamanho={16} />
            {r.texto}
            <span className="sr-only"> {r.ok ? "(cumprida)" : "(ainda não)"}</span>
          </li>
        ))}
      </ul>
      <AvisoErro>{erro}</AvisoErro>
    </TelaPasso>
  );
}
