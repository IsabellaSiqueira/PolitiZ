"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { modulo } from "@/data/trilha";
import { useProgresso } from "@/lib/progresso";
import { iniciais, useConta } from "@/lib/conta";
import { dados } from "@/lib/dados";
import { Icone } from "@/components/icones";
import { BotaoPrincipal, BotaoSecundario, Cabecalho, Cartao, Gaveta, Tela } from "@/components/ui";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Perfil() {
  const { aulasConcluidas, tentativas, decididas } = useProgresso();
  const concluidas = modulo.aulas.filter((a) => aulasConcluidas.includes(a.id)).length;
  const comTentativa = modulo.aulas.filter((a) => tentativas[a.id]?.length);
  const { conta, carregada, recarregar } = useConta();
  const router = useRouter();
  const [sair, setSair] = useState(false);

  const confirmarSaida = async () => {
    await dados.sair();
    await recarregar();
    setSair(false);
    router.push("/abertura");
  };

  return (
    <Tela>
      <Cabecalho />
      <main className="flex-1 pb-32">
        {/* tela F0 do protótipo: quem é, a turma e os atalhos da conta */}
        {carregada && conta ? (
          <div className="flex items-center gap-4 px-5 pt-4">
            <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-azul text-xl font-extrabold text-branco">
              {iniciais(conta.nome)}
            </span>
            <div className="min-w-0">
              <h1 className="t-titulo truncate">{conta.nome}</h1>
              <p className="text-[15px] text-suave">{conta.turma ? `${conta.turma.nome} · ${conta.turma.escola}` : "Plano gratuito"}</p>
            </div>
          </div>
        ) : (
          <div className="px-5 pt-4">
            <h1 className="t-titulo">Seu perfil</h1>
            {carregada && (
              <Cartao className="mt-4 px-4 py-4">
                <p className="t-corpo">Entre na sua conta para guardar o progresso e participar da sua turma.</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <BotaoSecundario href="/entrar">Entrar</BotaoSecundario>
                  <BotaoSecundario href="/criar-conta">Criar conta</BotaoSecundario>
                </div>
              </Cartao>
            )}
          </div>
        )}

        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl bg-azul px-4 py-4 text-branco">
          <Icone nome="voto" tamanho={22} className="mt-0.5 shrink-0" />
          <p>
            <span className="block text-base font-bold">Seu voto é seu.</span>
            <span className="text-[15px] leading-snug">O politiQ conta quantas leis você julgou, nunca como você votou.</span>
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 px-5 pt-5">
          <Numero rotulo="Aulas concluídas" valor={`${concluidas}/${modulo.aulas.length}`} />
          <Numero rotulo="Decisões no Voto às Cegas" valor={String(decididas.length)} />
        </dl>

        <section className="px-5 pt-5" aria-label="Histórico de quizzes">
          <Cartao rotulo="Histórico de quizzes" etiqueta={`${comTentativa.length} aula${comTentativa.length === 1 ? "" : "s"}`}>
            {comTentativa.length === 0 ? (
              <div className="flex flex-col gap-4 px-5 pt-2 pb-5">
                <p className="t-corpo">Você ainda não fez nenhum quiz. Leia a primeira aula e faça o quiz no final.</p>
                <BotaoPrincipal href="/trilhas" className="w-full">
                  Ir pra trilha
                  <Icone nome="seta" tamanho={20} />
                </BotaoPrincipal>
              </div>
            ) : (
              <ul className="pt-1">
                {comTentativa.map((a, i) => {
                  const lista = tentativas[a.id];
                  return (
                    <li key={a.id} className={`px-5 py-4 ${i ? "border-t border-linha" : ""}`}>
                      <p className="text-base font-bold">
                        Aula {a.numero} · {a.titulo}
                      </p>
                      <ol className="mt-2 flex flex-col gap-1">
                        {lista
                          .slice()
                          .reverse()
                          .map((t, j) => (
                            <li key={t.em} className="flex justify-between text-[13px] text-suave">
                              <span>Tentativa {lista.length - j}</span>
                              <span>
                                {t.acertos} de {t.total} · {data.format(new Date(t.em))}
                              </span>
                            </li>
                          ))}
                      </ol>
                    </li>
                  );
                })}
              </ul>
            )}
          </Cartao>
        </section>
        {conta && (
          <nav aria-label="Sua conta" className="px-5 pt-5">
            <ul className="border-t border-linha">
              {[
                ["/perfil/conta", "Minha conta"],
                ["/perfil/turma", "Minha turma"],
                ["/perfil/privacidade", "Privacidade e dados"],
                ["/perfil/ajuda", "Ajuda"],
              ].map(([href, nome]) => (
                <li key={href}>
                  <Link href={href} className="flex min-h-14 items-center justify-between border-b border-linha text-base font-semibold active:bg-claro">
                    {nome}
                    <Icone nome="seta" tamanho={18} />
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => setSair(true)} aria-haspopup="dialog" className="flex min-h-14 w-full items-center text-base font-semibold text-erro">
                  Sair da conta
                </button>
              </li>
            </ul>
          </nav>
        )}
      </main>
      {/* tela F13: confirmar sair */}
      <Gaveta aberta={sair} aoFechar={() => setSair(false)} titulo="Sair da conta?">
        <p className="t-corpo mt-2 text-suave">Seu progresso fica guardado. É só entrar de novo para continuar.</p>
        <div className="flex flex-col gap-3 pt-5">
          <BotaoSecundario onClick={confirmarSaida} className="w-full">
            Sair
          </BotaoSecundario>
          <BotaoSecundario onClick={() => setSair(false)} className="w-full">
            Ficar
          </BotaoSecundario>
        </div>
      </Gaveta>
    </Tela>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-2 rounded-2xl border-[1.5px] border-linha bg-branco px-4 py-4">
      <dt className="text-[13px] leading-tight font-semibold text-suave">{rotulo}</dt>
      <dd className="text-[32px] leading-none font-extrabold tracking-[-0.03em]">{valor}</dd>
    </div>
  );
}
