import { expect, test, type Request } from "@playwright/test";
import { armazenamento, comProgresso, ehVoto } from "./apoio";

// A Câmara simulada devolve os PLs 9015 a 9001, nesta ordem (tests/camara-simulada.mjs)
const ementa = (id: number) => `Ementa simulada do projeto ${id} para os testes.`;

test.describe("Voto às Cegas", () => {
  test("mostra a lei sem autor nem partido, que só chegam depois da decisão", async ({ page }) => {
    const pedidosDeAutoria: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/autoria/")) pedidosDeAutoria.push(r.url());
    });

    const resposta = await page.goto("/voto");
    await expect(page.getByRole("heading", { name: ementa(9015) })).toBeVisible();
    await expect(page.getByText("Fonte: Câmara dos Deputados")).toHaveCount(0);

    // a autoria não vai para o aparelho junto com a lei: nem no HTML, nem na tela
    const html = (await resposta?.text()) ?? "";
    expect(html).not.toContain("Simulada 9015");
    expect(html).not.toContain("PSIM");
    // só a região visível: durante o streaming o Next guarda uma cópia escondida da tela
    await expect(page.getByRole("region", { name: "Quem propôs" }).getByText("Oculto até a sua decisão", { exact: true })).toBeVisible();
    expect(pedidosDeAutoria).toEqual([]);

    await page.getByRole("button", { name: "Aprovo" }).click();

    await expect(page.getByText("Dep. Simulada 9015")).toBeVisible();
    await expect(page.getByText("PSIM-DF")).toBeVisible();
    await expect(page.getByText("e mais 1 coautor")).toBeVisible();
    await expect(page.getByRole("link", { name: /Ler o texto oficial na Câmara/ })).toHaveAttribute("href", /idProposicao=9015/);
    // a rota de autoria recebe só o id da lei
    expect(pedidosDeAutoria).toHaveLength(1);
    expect(new URL(pedidosDeAutoria[0]).pathname).toBe("/api/autoria/9015");
  });

  test("o voto nunca é gravado nem enviado (regra 1 do MVP)", async ({ page }) => {
    const saidas: string[] = [];
    const registrar = (r: Request) => saidas.push([r.method(), r.url(), r.postData() ?? "", JSON.stringify(r.headers())].join(" "));
    page.on("request", registrar);
    page.on("console", (m) => saidas.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => saidas.push(`erro: ${e.message}`));

    await page.goto("/voto");
    await page.getByRole("button", { name: "Aprovo" }).click();
    await expect(page.getByRole("status").filter({ hasText: "aprovou" })).toBeVisible();
    await page.getByRole("button", { name: "Próxima lei" }).click();

    await page.getByRole("button", { name: "Rejeito" }).click();
    await expect(page.getByRole("status").filter({ hasText: "rejeitou" })).toBeVisible();
    await page.getByRole("button", { name: "Próxima lei" }).click();
    await page.reload();
    await expect(page.getByRole("heading", { name: ementa(9013) })).toBeVisible();

    // o app guarda só QUE houve decisão (os ids), nunca qual foi
    const guardado = await armazenamento(page);
    expect(guardado).toContain("9015");
    expect(guardado).toContain("9014");
    expect(guardado).not.toMatch(ehVoto);
    expect(saidas.filter((s) => ehVoto.test(s))).toEqual([]);
  });

  test("lei decidida não volta, mesmo depois de recarregar", async ({ page }) => {
    await page.goto("/voto");
    await expect(page.getByRole("img", { name: /Lei 1 de 15/ })).toBeVisible();
    await page.getByRole("button", { name: "Rejeito" }).click();
    await page.getByRole("button", { name: "Próxima lei" }).click();
    await expect(page.getByRole("heading", { name: ementa(9014) })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("heading", { name: ementa(9014) })).toBeVisible();
    await expect(page.getByRole("img", { name: /Lei 2 de 15\. 1 decididas/ })).toBeVisible();
    await expect(page.getByText(ementa(9015))).toHaveCount(0);
  });

  test("pular não conta e a lei pulada volta no fim da sessão", async ({ page }) => {
    // 13 leis já decididas: sobram 9002 e 9001
    const decididas = Array.from({ length: 13 }, (_, i) => String(9015 - i));
    await comProgresso(page, { decididas });
    await page.goto("/voto");

    await expect(page.getByRole("heading", { name: ementa(9002) })).toBeVisible();
    await page.getByRole("button", { name: "Pular esta lei" }).click();

    // a posição não anda: pular não conta como decisão
    await expect(page.getByRole("heading", { name: ementa(9001) })).toBeVisible();
    await expect(page.getByRole("img", { name: /Lei 14 de 15\. 13 decididas/ })).toBeVisible();

    await page.getByRole("button", { name: "Aprovo" }).click();
    await page.getByRole("button", { name: "Próxima lei" }).click();
    await expect(page.getByRole("heading", { name: ementa(9002) })).toBeVisible();

    await page.getByRole("button", { name: "Rejeito" }).click();
    await page.getByRole("button", { name: "Fechar a sessão" }).click();
    await expect(page.getByRole("heading", { name: /Você decidiu 15 leis/ })).toBeVisible();
  });

  test("Aprovo e Rejeito têm o mesmo peso visual", async ({ page }) => {
    await page.goto("/voto");
    const aprovo = page.getByRole("button", { name: "Aprovo" });
    const rejeito = page.getByRole("button", { name: "Rejeito" });
    const [a, r] = await Promise.all([aprovo.boundingBox(), rejeito.boundingBox()]);
    expect(a && r).toBeTruthy();
    expect(Math.abs(a!.width - r!.width)).toBeLessThan(1);
    expect(Math.abs(a!.height - r!.height)).toBeLessThan(1);
    const estilo = (el: Element) => {
      const c = getComputedStyle(el);
      return [c.backgroundColor, c.color, c.borderColor, c.borderWidth, c.fontWeight, c.fontSize].join("|");
    };
    expect(await aprovo.evaluate(estilo)).toBe(await rejeito.evaluate(estilo));
  });
});
