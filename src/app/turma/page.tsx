"use client";

import { useState } from "react";
import { dados, ErroDados, mensagem, type TurmaEncontrada } from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { AvisoErro, CaixasCodigo, TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, Cartao, LinkTexto } from "@/components/ui";
import { Icone } from "@/components/icones";

/** Telas A7 (código da turma), A14 (código inválido) e A8 (turma encontrada). */
export default function EntrarNaTurma() {
  const { recarregar } = useConta();
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [turma, setTurma] = useState<TurmaEncontrada | null>(null);
  const [enviando, setEnviando] = useState(false);
  const limpo = codigo.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const faltam = Math.max(0, 8 - limpo.length);

  const enviar = async () => {
    if (faltam) return;
    setErro(null);
    setEnviando(true);
    try {
      const achada = await dados.entrarNaTurma(codigo);
      if (!achada) setErro(mensagem("codigo_invalido"));
      else {
        setTurma(achada);
        await recarregar();
      }
    } catch (e) {
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    } finally {
      setEnviando(false);
    }
  };

  if (turma) {
    return (
      <TelaPasso
        voltar="/como-vai-usar"
        rodape={
          <BotaoPrincipal href="/boas-vindas" className="w-full">
            Continuar
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
        }
      >
        <div role="status">
          <h1 className="t-titulo pt-4">Turma encontrada</h1>
        </div>
        <Cartao className="mt-5 px-5 py-4">
          <p className="t-rotulo text-suave">Escola</p>
          <p className="text-base font-bold">{turma.escola}</p>
          <p className="t-rotulo mt-3 text-suave">Turma</p>
          <p className="text-base font-bold">{turma.nome}</p>
        </Cartao>
        <p className="mt-4 rounded-2xl bg-claro px-4 py-3 text-[15px] leading-snug">
          Seu professor acompanha suas aulas e quizzes. Ele nunca vê como você votou no Voto às Cegas.
        </p>
      </TelaPasso>
    );
  }

  return (
    <TelaPasso
      voltar="/como-vai-usar"
      aoEnviar={enviar}
      rodape={
        <>
          <BotaoPrincipal type="submit" disabled={!!faltam || enviando} className="w-full">
            Entrar na turma
            <Icone nome="seta" tamanho={20} />
          </BotaoPrincipal>
          <LinkTexto href="/boas-vindas">Não tenho código</LinkTexto>
        </>
      }
    >
      <h1 className="t-titulo pt-4">Digite o código da turma</h1>
      <p className="t-corpo mt-2 text-suave">São 8 letras e números. Seu professor tem esse código.</p>
      <div className="mt-6">
        <CaixasCodigo
          rotulo="Código da turma, 8 letras e números"
          valor={codigo}
          aoMudar={(v) => {
            setCodigo(v);
            setErro(null);
          }}
          erro={!!erro}
        />
      </div>
      <p id="codigo-ajuda" className="mt-3 text-[13px] text-suave" aria-live="polite">
        {faltam ? `Faltam ${faltam} ${faltam === 1 ? "caractere" : "caracteres"}` : "Código completo"}
      </p>
      <AvisoErro>{erro}</AvisoErro>
    </TelaPasso>
  );
}
