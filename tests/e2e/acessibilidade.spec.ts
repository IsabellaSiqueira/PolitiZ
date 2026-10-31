import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { modulo } from "../../src/data/trilha";
import { comProgresso } from "./apoio";

const aula1 = modulo.aulas[0];

/** Telas e como chegar nelas. */
const telas: { nome: string; abrir: (page: Page) => Promise<void> }[] = [
  { nome: "Início", abrir: async (p) => void (await p.goto("/")) },
  { nome: "Trilhas", abrir: async (p) => void (await p.goto("/trilhas")) },
  { nome: "Aula", abrir: async (p) => void (await p.goto(`/aula/${aula1.id}`)) },
  {
    nome: "Quiz respondido",
    abrir: async (p) => {
      await comProgresso(p, { aulasConcluidas: [aula1.id] });
      await p.goto(`/quiz/${aula1.id}`);
      await p.locator("fieldset button").first().click();
      await p.getByRole("button", { name: "Responder" }).click();
      await expect(p.getByRole("button", { name: /Próxima pergunta/ })).toBeVisible();
    },
  },
  { nome: "Voto às Cegas", abrir: async (p) => void (await p.goto("/voto")) },
  {
    nome: "Voto às Cegas revelado",
    abrir: async (p) => {
      await p.goto("/voto");
      await p.getByRole("button", { name: "Aprovo" }).click();
      await expect(p.getByText("Agora você sabe quem propôs")).toBeVisible();
      // espera o carimbo e a revelação terminarem de animar
      await p.waitForTimeout(800);
    },
  },
  { nome: "Critério", abrir: async (p) => void (await p.goto("/criterio")) },
  { nome: "Perfil", abrir: async (p) => void (await p.goto("/perfil")) },
  { nome: "Jogos", abrir: async (p) => void (await p.goto("/jogos")) },
];

test.describe("Acessibilidade (WCAG 2.1 AA)", () => {
  for (const t of telas) {
    test(`${t.nome}: sem violações do axe`, async ({ page }) => {
      await t.abrir(page);
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });

    test(`${t.nome}: alvos tocáveis de 44px ou mais`, async ({ page }) => {
      await t.abrir(page);
      const pequenos = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [role=button]")]
          .filter((el) => el.offsetParent !== null || getComputedStyle(el).position === "fixed")
          // links dentro de um parágrafo de texto seguem o tamanho da linha (exceção da WCAG)
          .filter((el) => !(el.tagName === "A" && el.closest("p")))
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width > 0 && (r.height < 44 || r.width < 44))
          .map(({ el, r }) => `${el.tagName} "${el.textContent?.trim() || el.getAttribute("aria-label")}" ${Math.round(r.width)}x${Math.round(r.height)}`),
      );
      expect(pequenos).toEqual([]);
    });

    test(`${t.nome}: sem rolagem lateral em 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await t.abrir(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    });
  }

  test("o voto é feito só pelo teclado, com foco visível", async ({ page }) => {
    await page.goto("/voto");
    const rejeito = page.getByRole("button", { name: "Rejeito" });
    for (let i = 0; i < 20 && !(await rejeito.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press("Tab");
    await expect(rejeito).toBeFocused();
    const contorno = await rejeito.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(contorno).not.toBe("none");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Aprovo" })).toBeFocused();
    await page.keyboard.press("Enter");
    // o foco segue para a próxima ação, já que os botões de voto saem da tela
    await expect(page.getByRole("button", { name: "Próxima lei" })).toBeFocused();
  });
});

test.describe("LGPD", () => {
  test("nenhuma requisição sai para terceiros", async ({ page, baseURL }) => {
    const fora: string[] = [];
    page.on("request", (r) => {
      if (!r.url().startsWith(baseURL!) && !r.url().startsWith("data:")) fora.push(r.url());
    });
    for (const rota of ["/", "/trilhas", `/aula/${aula1.id}`, "/voto", "/jogos", "/perfil", "/criterio"]) {
      await page.goto(rota);
      await page.waitForLoadState("networkidle");
    }
    await page.goto("/voto");
    await page.getByRole("button", { name: "Aprovo" }).click();
    await expect(page.getByText("Agora você sabe quem propôs")).toBeVisible();
    expect(fora).toEqual([]);
  });
});
