import { expect, test, type Page, type Request } from "@playwright/test";
import { modulo } from "../../src/data/trilha";
import { armazenamento, comProgresso, ehVoto } from "./apoio";

const aula1 = modulo.aulas[0];

/** Contexto da lei como o banco vai devolver; a Câmara simulada não tem esse texto. */
async function comContexto(page: Page) {
  await page.route("**/api/autoria/9015", async (rota) => {
    const r = await rota.fetch();
    const dados = await r.json();
    await rota.fulfill({
      json: {
        ...dados,
        contexto: {
          problema: "Quem trabalha de dia não chega ao posto antes de ele fechar.",
          muda: "Os postos abririam até as 22h.",
          afetados: "Quem usa o SUS e as prefeituras.",
          argumentos: "A favor: mais acesso. Contra: custo para as cidades.",
          situacao: "Esperando votação na comissão.",
        },
      },
    });
  });
}

function vigiar(page: Page) {
  const saidas: string[] = [];
  page.on("request", (r: Request) => saidas.push([r.url(), r.postData() ?? ""].join(" ")));
  page.on("console", (m) => saidas.push(m.text()));
  return saidas;
}

test.describe("Tela de entrada do módulo (Y8)", () => {
  test("a resposta só muda a frase de abertura e não é guardada", async ({ page }) => {
    const saidas = vigiar(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Começar a aula" }).click();
    await expect(page).toHaveURL(/\/entrada$/);
    await expect(page.getByRole("heading", { name: /Todo mundo já votou em algo sem entender/ })).toBeVisible();
    await page.getByRole("button", { name: "Concordo" }).click();

    await expect(page).toHaveURL(new RegExp(`/aula/${aula1.id}$`));
    await expect(page.getByText("Então vamos ver por quê.")).toBeVisible();
    expect(await armazenamento(page)).not.toMatch(ehVoto);
    expect(saidas.filter((s) => ehVoto.test(s))).toEqual([]);

    // a tela aparece uma vez; depois a trilha leva direto para a aula
    await page.goto("/trilhas");
    await expect(page.getByRole("link", { name: new RegExp(aula1.titulo) })).toHaveAttribute("href", `/aula/${aula1.id}`);
    // recarregando, a frase some: a resposta nunca foi guardada
    await page.goto(`/aula/${aula1.id}`);
    await expect(page.getByText("Então vamos ver por quê.")).toHaveCount(0);
  });

  test("Concordo e Discordo têm o mesmo peso visual", async ({ page }) => {
    await page.goto("/entrada");
    const estilo = (el: Element) => {
      const c = getComputedStyle(el);
      return [c.backgroundColor, c.color, c.borderColor, c.borderWidth, c.fontWeight, (el as HTMLElement).offsetWidth].join("|");
    };
    expect(await page.getByRole("button", { name: "Concordo" }).evaluate(estilo)).toBe(await page.getByRole("button", { name: "Discordo" }).evaluate(estilo));
  });
});

test.describe("Glossário (Y6)", () => {
  test("o termo sublinhado abre a definição sem sair da aula", async ({ page }) => {
    await comProgresso(page, { entradaVista: true });
    await page.goto(`/aula/${aula1.id}`);
    // aparece sublinhado só na primeira vez
    await expect(page.getByRole("button", { name: "Constituição" })).toHaveCount(1);
    await page.getByRole("button", { name: "Constituição" }).click();
    const gaveta = page.getByRole("dialog", { name: "Constituição" });
    await expect(gaveta.getByText("A lei mais importante do país.", { exact: false })).toBeVisible();
    await gaveta.getByRole("button", { name: "Entendi" }).click();
    await expect(gaveta).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`/aula/${aula1.id}$`));
  });

  test("o glossário abre no quiz sem perder a pergunta", async ({ page }) => {
    await comProgresso(page, { aulasConcluidas: [aula1.id] });
    await page.goto(`/quiz/${aula1.id}`);
    const pergunta = await page.locator("main h1").textContent();
    await page.getByRole("button", { name: "Abrir o glossário" }).click();
    const gaveta = page.getByRole("dialog", { name: "Glossário" });
    await gaveta.getByRole("searchbox").fill("veto");
    await expect(gaveta.getByText("Veto", { exact: true })).toBeVisible();
    await gaveta.getByRole("button", { name: "Fechar o glossário" }).click();
    await expect(page.locator("main h1")).toHaveText(pergunta!);
  });

  test("a página do glossário busca sem acento", async ({ page }) => {
    await page.goto("/glossario");
    await page.getByRole("searchbox", { name: "Buscar no glossário" }).fill("sancao");
    await expect(page.getByText("Sanção", { exact: true })).toBeVisible();
    await expect(page.getByText("Plenário", { exact: true })).toHaveCount(0);
  });
});

test.describe("Voto às Cegas: atalhos e revelação", () => {
  test("deslizar para a direita aprova, como o botão (Y7)", async ({ page }) => {
    await page.goto("/voto");
    const area = page.getByRole("region", { name: "Projeto de lei" });
    const caixa = (await area.boundingBox())!;
    const y = caixa.y + caixa.height / 2;
    await page.mouse.move(caixa.x + 60, y);
    await page.mouse.down();
    await page.mouse.move(caixa.x + 140, y, { steps: 4 });
    await page.mouse.move(caixa.x + 260, y, { steps: 4 });
    await page.mouse.up();
    await expect(page.getByRole("status").filter({ hasText: "aprovou" })).toBeVisible();
    await expect(page.getByText("Dep. Simulada 9015", { exact: true })).toBeVisible();
  });

  test("deslizar para a esquerda rejeita, e um gesto curto não decide nada", async ({ page }) => {
    await page.goto("/voto");
    const area = page.getByRole("region", { name: "Projeto de lei" });
    const caixa = (await area.boundingBox())!;
    const y = caixa.y + caixa.height / 2;
    // gesto curto: nada acontece
    await page.mouse.move(caixa.x + 200, y);
    await page.mouse.down();
    await page.mouse.move(caixa.x + 160, y, { steps: 3 });
    await page.mouse.up();
    await expect(page.getByRole("button", { name: "Aprovo" })).toBeVisible();
    // gesto longo para a esquerda
    await page.mouse.move(caixa.x + 300, y);
    await page.mouse.down();
    await page.mouse.move(caixa.x + 200, y, { steps: 4 });
    await page.mouse.move(caixa.x + 60, y, { steps: 4 });
    await page.mouse.up();
    await expect(page.getByRole("status").filter({ hasText: "rejeitou" })).toBeVisible();
  });

  test("a revelação traz as votações do autor e o contexto da lei (Y10, Y12)", async ({ page }) => {
    const saidas = vigiar(page);
    await comContexto(page);
    await page.goto("/voto");
    await page.getByRole("button", { name: "Rejeito" }).click();
    await expect(page.getByRole("link", { name: /Ver votações de Dep\. Simulada 9015 na Câmara/ })).toHaveAttribute("href", /\/deputados\/5015$/);

    await page.getByRole("button", { name: "Ver o contexto da lei" }).click();
    await expect(page.getByRole("heading", { name: /Ementa simulada do projeto 9015/ })).toBeFocused();
    for (const rotulo of ["O problema", "O que muda", "Quem é afetado", "Argumentos", "Onde está agora"]) {
      await expect(page.getByText(rotulo, { exact: true })).toBeVisible();
    }
    await page.getByRole("button", { name: "Mudei de ideia" }).click();
    await expect(page.getByText("Você mudou de ideia.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Próxima lei" }).click();
    await expect(page.getByRole("heading", { name: /Ementa simulada do projeto 9014/ })).toBeVisible();

    // a reavaliação, como o voto, nunca sai da tela
    expect(await armazenamento(page)).not.toMatch(ehVoto);
    expect(saidas.filter((s) => ehVoto.test(s))).toEqual([]);
  });

  test("a pergunta da TRC aparece no fim da sessão e não guarda a resposta (Y11)", async ({ page }) => {
    const saidas = vigiar(page);
    await comProgresso(page, { decididas: Array.from({ length: 14 }, (_, i) => String(9015 - i)) });
    await page.goto("/voto");
    await page.getByRole("button", { name: "Aprovo" }).click();
    await page.getByRole("button", { name: "Fechar a sessão" }).click();

    const pergunta = page.getByRole("region", { name: /você pretende fazer alguma destas coisas/ });
    await expect(pergunta).toBeVisible();
    const enviar = pergunta.getByRole("button", { name: "Enviar" });
    await expect(enviar).toBeDisabled();
    await pergunta.getByLabel("Conversar sobre política com alguém").check();
    await pergunta.getByLabel("Nenhuma por agora").check();
    // "Nenhuma por agora" não combina com as outras
    await expect(pergunta.getByLabel("Conversar sobre política com alguém")).not.toBeChecked();
    await pergunta.getByLabel("Acompanhar uma votação no Congresso").check();
    await expect(pergunta.getByLabel("Nenhuma por agora")).not.toBeChecked();
    await enviar.click();
    await expect(page.getByText("Sua resposta entra só numa contagem geral, sem o seu nome.")).toBeVisible();

    const guardado = await armazenamento(page);
    expect(guardado).not.toContain("Acompanhar");
    expect(saidas.filter((s) => s.includes("Acompanhar") || s.includes("Conversar"))).toEqual([]);
  });
});

test.describe("PWA (Y13)", () => {
  test("o manifesto permite instalar na tela inicial", async ({ request }) => {
    const r = await request.get("/manifest.webmanifest");
    expect(r.ok()).toBeTruthy();
    const m = await r.json();
    expect(m.name).toBe("politiQ");
    expect(m.display).toBe("standalone");
    expect(m.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    for (const i of m.icons) expect((await request.get(i.src)).ok()).toBeTruthy();
  });
});
