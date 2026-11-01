"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { AvisoErro, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, Campo, LinkTexto } from "@/components/ui";

/** Telas A2 (entrar) e A15 (senha incorreta). */
export default function Entrar() {
  const router = useRouter();
  const { recarregar } = useConta();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setErro(null);
    setEnviando(true);
    try {
      await dados.entrar(email, senha);
      await recarregar();
      const conta = await dados.conta();
      router.push(conta?.termosPendentes ? "/termos-e-privacidade" : "/");
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    } finally {
      setEnviando(false);
    }
  };

  const credenciais = erro === mensagem("credenciais_invalidas");
  return (
    <TelaPasso
      titulo="Entrar"
      voltar="/abertura"
      aoEnviar={enviar}
      rodape={
        <>
          <BotaoPrincipal type="submit" disabled={enviando} className="w-full">
            Entrar
          </BotaoPrincipal>
          <LinkTexto href="/criar-conta">Criar uma conta</LinkTexto>
        </>
      }
    >
      <h1 className="t-titulo pt-4">Que bom te ver de novo</h1>
      <div className="mt-6 flex flex-col gap-4">
        <Campo rotulo="E-mail" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={credenciais ? erro : null}
        />
      </div>
      <div className="pt-1">
        <LinkTexto href="/recuperar-senha" azul>
          Esqueci minha senha
        </LinkTexto>
      </div>
      {!credenciais && <AvisoErro>{erro}</AvisoErro>}
    </TelaPasso>
  );
}
