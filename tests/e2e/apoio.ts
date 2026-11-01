import { expect, type Page } from "@playwright/test";
import type { Aula } from "../../src/data/trilha";

/** Mesma chave e formato de src/lib/progresso.tsx. */
export const CHAVE_PROGRESSO = "politiq:v2";

type Progresso = {
  entradaVista?: boolean;
  aulasConcluidas?: string[];
  tentativas?: Record<string, { acertos: number; total: number; em: string }[]>;
  decididas?: string[];
  puladas?: string[];
};

/** Começa o teste com um progresso já salvo no navegador (antes de qualquer script do app). */
export async function comProgresso(page: Page, p: Progresso) {
  const estado = { aulasConcluidas: [], tentativas: {}, decididas: [], puladas: [], entradaVista: false, ...p };
  await page.addInitScript(
    ([chave, valor]) => {
      // só na primeira carga: depois o app é quem escreve
      if (!sessionStorage.getItem("teste:semeado")) {
        localStorage.setItem(chave, valor);
        sessionStorage.setItem("teste:semeado", "1");
      }
    },
    [CHAVE_PROGRESSO, JSON.stringify(estado)] as const,
  );
}

/** Tudo o que o navegador guarda e que poderia, por engano, conter o voto. */
export async function armazenamento(page: Page) {
  const local = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  const cookies = JSON.stringify(await page.context().cookies());
  return local + cookies;
}

/** Voto, reavaliação do contexto e resposta da tela de entrada: nada disso pode sair da tela. */
export const ehVoto = /aprov|rejeit|mantenho|mantev|mudei|mudou de ideia|concordo|discordo/i;

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Botão da alternativa pelo texto (a letra muda, porque as alternativas são embaralhadas). */
export const alternativa = (page: Page, texto: string) =>
  page.locator("fieldset").getByRole("button", { name: new RegExp(`^[A-E]\\s*${escapar(texto)}`) });

/** Faz o quiz da aula; `errar` diz quantas perguntas responder errado (as primeiras que aparecerem). */
export async function fazerQuiz(page: Page, aula: Aula, errar = 0) {
  await page.goto(`/quiz/${aula.id}`);
  for (let i = 0; i < aula.perguntas.length; i++) {
    const titulo = (await page.locator("main h1").textContent())!.trim();
    const p = aula.perguntas.find((q) => titulo.startsWith(q.enunciado.slice(0, 20)))!;
    const alvo = i < errar ? p.alternativas.find((a) => a.letra !== p.correta)! : p.alternativas.find((a) => a.letra === p.correta)!;
    await alternativa(page, alvo.texto).click();
    await page.getByRole("button", { name: "Responder" }).click();
    await page.getByRole("button", { name: i + 1 < aula.perguntas.length ? "Próxima pergunta" : "Ver resultado" }).click();
  }
  await expect(page.getByRole("heading", { name: /Você acertou/ })).toBeVisible();
}
