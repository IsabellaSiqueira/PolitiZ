"use client";

import { useCallback, useState } from "react";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { AvisoErro, AvisoRapido, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, BotaoSecundario, Campo, LinkTexto } from "@/components/ui";

/** Telas A3 (recuperar senha), A4 (e-mail enviado) e A4b (e-mail reenviado). */
export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const sumir = useCallback(() => setAviso(null), []);

  const enviar = async (de_novo = false) => {
    setErro(null);
    try {
      await dados.pedirNovaSenha(email);
      setEnviado(true);
      if (de_novo) setAviso("E-mail reenviado");
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  };

  if (enviado) {
    return (
      <TelaPasso
        titulo="Recuperar senha"
        voltar="/entrar"
        rodape={
          <>
            <BotaoPrincipal href="/nova-senha" className="w-full">
              Já abri o link
            </BotaoPrincipal>
            <BotaoSecundario onClick={() => enviar(true)} className="w-full">
              Reenviar e-mail
            </BotaoSecundario>
          </>
        }
      >
        <AvisoRapido texto={aviso} aoSumir={sumir} />
        <h1 className="t-titulo pt-4">Confira seu e-mail</h1>
        <p className="t-corpo mt-2">
          Se existir uma conta com <strong>{email.trim()}</strong>, mandamos um link para criar uma senha nova. Ele vale por 1 hora.
        </p>
        <p className="t-corpo mt-2 text-suave">Não chegou? Olhe a caixa de spam ou peça de novo.</p>
      </TelaPasso>
    );
  }

  return (
    <TelaPasso
      titulo="Recuperar senha"
      voltar="/entrar"
      aoEnviar={() => enviar()}
      rodape={
        <>
          <BotaoPrincipal type="submit" className="w-full">
            Enviar link
          </BotaoPrincipal>
          <LinkTexto href="/entrar">Lembrei a senha</LinkTexto>
        </>
      }
    >
      <h1 className="t-titulo pt-4">Esqueceu a senha?</h1>
      <p className="t-corpo mt-1 text-suave">A gente manda um link para você criar uma nova.</p>
      <div className="mt-6">
        <Campo rotulo="E-mail" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <AvisoErro>{erro}</AvisoErro>
    </TelaPasso>
  );
}
