import { expect, test } from "@playwright/test";
import { modulo } from "../../src/data/trilha";

const [aula1, aula2] = modulo.aulas;

test.describe("Trilha, aulas e quiz", () => {
  test("as aulas liberam em sequência", async ({ page }) => {
    await page.goto("/trilhas");
    await expect(page.getByRole("link", { name: new RegExp(aula1.titulo) })).toBeVisible();
    // a aula 2 aparece, mas sem link, até a 1 ser concluída
    await expect(page.getByRole("link", { name: new RegExp(aula2.titulo) })).toHaveCount(0);
    await expect(page.getByText("Libera depois da aula 1")).toBeVisible();

    await page.goto(`/aula/${aula2.id}`);
    await expect(page.getByText("Esta aula libera depois que você concluir a aula 1.")).toBeVisible();

    await page.goto(`/aula/${aula1.id}`);
    await page.getByRole("button", { name: "Marcar como concluída" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Aula concluída" })).toBeVisible();

    await page.goto("/trilhas");
    await expect(page.getByRole("link", { name: new RegExp(aula2.titulo) })).toBeVisible();
  });

  test("o quiz só abre depois da leitura", async ({ page }) => {
    await page.goto(`/quiz/${aula1.id}`);
    await expect(page.getByText("Leia a aula e marque como concluída antes de fazer o quiz.")).toBeVisible();
  });

  test("quiz com explicação, resultado e histórico de tentativas", async ({ page }) => {
    await page.goto(`/aula/${aula1.id}`);
    await page.getByRole("button", { name: "Marcar como concluída" }).click();
    await page.getByRole("link", { name: "Fazer o quiz" }).click();

    let acertos = 0;
    for (const [i, p] of aula1.perguntas.entries()) {
      await expect(page.getByRole("heading", { name: p.enunciado })).toBeVisible();
      // erra a primeira de propósito, acerta as outras
      const errada = p.alternativas.find((a) => a.letra !== p.correta)!;
      const escolha = i === 0 ? errada : p.alternativas.find((a) => a.letra === p.correta)!;
      await page.getByRole("button", { name: new RegExp(`^${escolha.letra}\\s*${escolha.texto}`) }).click();
      // marcar não responde: só o botão confirma (D10)
      await expect(page.getByText(p.explicacao)).toHaveCount(0);
      await page.getByRole("button", { name: "Responder" }).click();
      if (i === 0) {
        await expect(page.getByText(`A resposta é a ${p.correta}`)).toBeVisible();
        // a cor nunca vem sozinha: errada e certa também são anunciadas em texto
        await expect(page.getByText("Sua resposta, errada")).toBeAttached();
      } else {
        acertos++;
        await expect(page.getByText("Resposta correta!")).toBeVisible();
      }
      await expect(page.getByText(p.explicacao)).toBeVisible();
      await page.getByRole("button", { name: i + 1 < aula1.perguntas.length ? "Próxima pergunta" : "Ver resultado" }).click();
    }

    const total = aula1.perguntas.length;
    await expect(page.getByRole("heading", { name: `${acertos} de ${total}` })).toBeVisible();

    // pode ser refeito, e cada tentativa fica no histórico
    await page.getByRole("button", { name: "Refazer o quiz" }).click();
    await expect(page.getByRole("heading", { name: aula1.perguntas[0].enunciado })).toBeVisible();

    await page.goto("/perfil");
    await expect(page.getByText(`Aula 1 · ${aula1.titulo}`)).toBeVisible();
    await expect(page.getByText("Tentativa 1")).toBeVisible();
    await expect(page.getByText(new RegExp(`${acertos} de ${total} ·`))).toBeVisible();
  });

  test("a busca do Início encontra as aulas", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: "Buscar temas e palavras nas aulas" }).fill("constituicao");
    await expect(page.getByRole("link", { name: /Aula 1 · Os Três Poderes/ })).toBeVisible();
    await page.getByRole("searchbox").fill("xyzabc");
    await expect(page.getByText("Nenhuma aula fala de “xyzabc” ainda.")).toBeVisible();
  });
});
