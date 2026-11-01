"use client";

import { useState } from "react";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { iniciais, useConta } from "@/lib/conta";
import { AvisoErro, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, Campo, LinkTexto } from "@/components/ui";

/** Tela F10: editar conta. Sem foto (o avatar são as iniciais, sem upload). */
export default function MinhaConta() {
  const { conta, recarregar } = useConta();
  const [nome, setNome] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  if (!conta) return <SemConta />;
  const valor = nome ?? conta.nome;

  const salvar = async () => {
    setErro(null);
    setSalvo(false);
    try {
      await dados.atualizarNome(valor);
      await recarregar();
      setSalvo(true);
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  };

  return (
    <TelaPasso
      titulo="Minha conta"
      voltar="/perfil"
      aoEnviar={salvar}
      rodape={
        <BotaoPrincipal type="submit" className="w-full">
          Salvar
        </BotaoPrincipal>
      }
    >
      <span aria-hidden="true" className="mx-auto mt-4 flex size-20 items-center justify-center rounded-full bg-azul text-2xl font-extrabold text-branco">
        {iniciais(valor || conta.nome)}
      </span>
      <div className="mt-6 flex flex-col gap-4">
        <Campo rotulo="Nome" autoComplete="nickname" value={valor} onChange={(e) => setNome(e.target.value)} />
        <Campo rotulo="E-mail" type="email" value={conta.email} readOnly ajuda="Para trocar o e-mail, fale com o politiQ." />
      </div>
      <div className="pt-2">
        <LinkTexto href="/recuperar-senha" azul>
          Trocar a senha
        </LinkTexto>
      </div>
      {salvo && (
        <p role="status" className="mt-3 text-[15px] font-semibold text-azul">
          Nome salvo.
        </p>
      )}
      <AvisoErro>{erro}</AvisoErro>
    </TelaPasso>
  );
}

function SemConta() {
  return (
    <TelaPasso titulo="Minha conta" voltar="/perfil">
      <p className="t-corpo pt-6">Entre na sua conta para ver e editar seus dados.</p>
      <div className="pt-2">
        <LinkTexto href="/entrar" azul>
          Entrar
        </LinkTexto>
      </div>
    </TelaPasso>
  );
}
