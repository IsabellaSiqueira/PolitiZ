"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { AvisoErro, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, Campo, LinkTexto } from "@/components/ui";
import { Icone } from "@/components/icones";

/**
 * Tela A1: criar conta. Só o necessário (LGPD): nome de exibição, e-mail e senha.
 * A data de nascimento e a autorização do responsável (A12, A13) esperam a decisão
 * da base legal com o jurídico (docs/plano-mvp.md).
 */
export default function CriarConta() {
  const router = useRouter();
  const { recarregar } = useConta();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    setErro(null);
    setEnviando(true);
    try {
      await dados.cadastrar({ nome, email, senha });
      await recarregar();
      router.push("/termos-e-privacidade");
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <TelaPasso
      titulo="Criar conta"
      voltar="/abertura"
      aoEnviar={enviar}
      rodape={
        <>
          <BotaoPrincipal type="submit" disabled={enviando} className="w-full">
            Continuar
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
          <LinkTexto href="/entrar">Já tenho uma conta</LinkTexto>
        </>
      }
    >
      <h1 className="t-titulo pt-4">Bora começar</h1>
      <p className="t-corpo mt-1 text-suave">Leva menos de um minuto. Depois é só aprender.</p>
      <div className="mt-6 flex flex-col gap-4">
        <Campo rotulo="Nome" placeholder="Como quer ser chamado" autoComplete="nickname" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Campo rotulo="E-mail" type="email" placeholder="seuemail@exemplo.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Campo
          rotulo="Senha"
          type="password"
          placeholder="Pelo menos 8 caracteres"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>
      <AvisoErro>{erro}</AvisoErro>
    </TelaPasso>
  );
}
