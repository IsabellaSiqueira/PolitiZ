import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { ehVoto } from "./apoio";

/**
 * Painel do professor e da coordenação: ainda sem desenho, só dados e rotas
 * (módulo de dados simulado, src/lib/dados/painel-simulado.ts).
 */
test.describe("Painel do professor (sem desenho)", () => {
  test("lista as turmas e abre o painel com os indicadores, sem nenhum voto", async ({ page }) => {
    await page.goto("/painel");
    await expect(page.getByText("Rascunho sem desenho", { exact: false })).toBeVisible();
    await page.getByRole("link", { name: "1º ano A" }).click();
    await expect(page.getByRole("heading", { name: "Painel da turma" })).toBeVisible();
    for (const r of ["Alunos matriculados", "Alunos ativos", "Aulas concluídas", "Acerto nos quizzes", "Decisões no Voto às Cegas"]) {
      await expect(page.locator("dt").filter({ hasText: r })).toBeVisible();
    }
    await expect(page.getByRole("region", { name: "Desempenho por aluno" }).getByText("Ana Souza")).toBeVisible();
    // do Voto às Cegas, só a contagem
    expect(await page.locator("main").filter({ visible: true }).innerText()).not.toMatch(ehVoto);
  });

  test("o CSV abre no Excel em português e não traz voto", async ({ page }) => {
    await page.goto("/painel/turma/turma-exemplo");
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Baixar CSV" }).click()]);
    const csv = await readFile((await download.path())!, "utf8");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const linhas = csv.slice(1).trim().split("\r\n");
    expect(linhas[0]).toBe("Aluno;Aulas concluídas;Quizzes feitos;Acerto (%);Decisões no Voto às Cegas;Última atividade");
    expect(linhas).toHaveLength(7);
    expect(linhas[1]).toMatch(/^Ana Souza;\d+;\d+;90;15;2026-10-30$/);
    expect(csv).not.toMatch(/aprov|rejeit/i);
  });
});
