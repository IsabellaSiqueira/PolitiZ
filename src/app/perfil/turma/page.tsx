"use client";

import { useConta } from "@/lib/conta";
import { TelaPasso } from "@/components/entrada";
import { BotaoPrincipal, Cartao, LinkTexto } from "@/components/ui";

/**
 * Tela F11: minha turma. Trocar de turma passa pela coordenação (decisão D2), então
 * não há botão "sair da turma" para o aluno.
 */
export default function MinhaTurma() {
  const { conta } = useConta();
  const turma = conta?.turma;
  return (
    <TelaPasso
      titulo="Minha turma"
      voltar="/perfil"
      rodape={
        !turma && conta ? (
          <BotaoPrincipal href="/turma" className="w-full">
            Entrar numa turma
          </BotaoPrincipal>
        ) : undefined
      }
    >
      {turma ? (
        <>
          <Cartao className="mt-4 px-5 py-4">
            <p className="t-rotulo text-suave">Escola</p>
            <p className="text-base font-bold">{turma.escola}</p>
            <p className="t-rotulo mt-3 text-suave">Turma</p>
            <p className="text-base font-bold">{turma.nome}</p>
          </Cartao>
          <p className="mt-4 rounded-2xl bg-claro px-4 py-3 text-[15px] leading-snug">
            Seu professor acompanha suas aulas e quizzes. Ele nunca vê como você votou no Voto às Cegas.
          </p>
          <p className="t-corpo mt-4 text-suave">Para trocar de turma, fale com a coordenação da sua escola.</p>
        </>
      ) : conta ? (
        <p className="t-corpo mt-6">
          Você está no plano gratuito: 5 aulas novas e 5 decisões no Voto às Cegas por dia. Com o código da sua turma, os limites somem.
        </p>
      ) : (
        <>
          <p className="t-corpo pt-6">Entre na sua conta para ver sua turma.</p>
          <LinkTexto href="/entrar" azul>
            Entrar
          </LinkTexto>
        </>
      )}
    </TelaPasso>
  );
}
