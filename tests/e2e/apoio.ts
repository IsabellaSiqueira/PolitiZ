import type { Page } from "@playwright/test";

/** Mesma chave e formato de src/lib/progresso.tsx. */
export const CHAVE_PROGRESSO = "politiq:v2";

type Progresso = {
  aulasConcluidas?: string[];
  tentativas?: Record<string, { acertos: number; total: number; em: string }[]>;
  decididas?: string[];
  puladas?: string[];
};

/** Começa o teste com um progresso já salvo no navegador (antes de qualquer script do app). */
export async function comProgresso(page: Page, p: Progresso) {
  const estado = { aulasConcluidas: [], tentativas: {}, decididas: [], puladas: [], ...p };
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

export const ehVoto = /aprov|rejeit/i;
