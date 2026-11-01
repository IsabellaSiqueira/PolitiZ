"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dados, ErroDados, mensagem } from "@/lib/dados";
import { useConta } from "@/lib/conta";
import { AvisoErro, TelaPasso } from "@/components/entrada";
import { BotaoSecundario, Gaveta, LinkTexto } from "@/components/ui";

const GUARDAMOS = ["Nome de exibição e e-mail", "Sua turma", "Aulas lidas e respostas dos quizzes", "Quais leis você já decidiu"];
const NUNCA = ["Como você votou no Voto às Cegas", "Por que votou ou se mudou de ideia", "Suas respostas de opinião", "Rastreadores ou anúncios de outras empresas"];

/** Telas F5 (privacidade e dados) e F12 (confirmar apagar conta). */
export default function PrivacidadeEDados() {
  const router = useRouter();
  const { conta, recarregar } = useConta();
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const apagar = async () => {
    setErro(null);
    try {
      await dados.apagarConta();
      await recarregar();
      router.push("/abertura");
    } catch (e) {
      setConfirmar(false);
      setErro(mensagem(e instanceof ErroDados ? e.codigo : ""));
    }
  };

  return (
    <TelaPasso titulo="Privacidade e dados" voltar="/perfil">
      <h2 className="t-subtitulo pt-4">O que guardamos</h2>
      <ul className="mt-2 list-disc pl-5 t-corpo">
        {GUARDAMOS.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
      <h2 className="t-subtitulo pt-5">O que nunca guardamos</h2>
      <ul className="mt-2 list-disc pl-5 t-corpo">
        {NUNCA.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
      <div className="pt-3">
        <LinkTexto href="/privacidade" azul>
          Ler a Política de privacidade
        </LinkTexto>
      </div>

      {conta && (
        <>
          <h2 className="t-subtitulo pt-6">Apagar minha conta</h2>
          <p className="t-corpo mt-1 text-suave">Apaga sua conta e seu progresso. Não dá para desfazer.</p>
          <BotaoSecundario onClick={() => setConfirmar(true)} className="mt-3 w-full border-erro text-erro">
            Apagar minha conta
          </BotaoSecundario>
        </>
      )}
      <AvisoErro>{erro}</AvisoErro>

      <Gaveta aberta={confirmar} aoFechar={() => setConfirmar(false)} titulo="Apagar sua conta?">
        <ul className="mt-2 list-disc pl-5 t-corpo text-suave">
          <li>Seu nome, e-mail e progresso são apagados.</li>
          <li>Você sai da sua turma.</li>
          <li>Suas respostas de quiz ficam só nas estatísticas das questões, sem o seu nome.</li>
        </ul>
        <div className="flex flex-col gap-3 pt-5">
          <BotaoSecundario onClick={apagar} className="w-full border-erro text-erro">
            Apagar para sempre
          </BotaoSecundario>
          <BotaoSecundario onClick={() => setConfirmar(false)} className="w-full">
            Cancelar
          </BotaoSecundario>
        </div>
      </Gaveta>
    </TelaPasso>
  );
}
