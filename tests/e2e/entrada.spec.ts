import { expect, test, type Page } from "@playwright/test";

// o Next guarda a tela anterior escondida durante a navegação: só vale o que está visível
const campo = (page: Page, rotulo: string) => page.getByLabel(rotulo, { exact: true }).filter({ visible: true });
const alerta = (page: Page) => page.locator("main [role=alert]").filter({ visible: true });

/**
 * Telas de entrada e do perfil (protótipo v5, A e F), com o módulo de acesso a dados simulado.
 * Códigos de exemplo em src/lib/dados/simulado.ts.
 */
async function criarConta(page: Page, nome = "Ana Teste") {
  await page.goto("/abertura");
  await page.getByRole("link", { name: "Começar" }).click();
  await campo(page, "Nome").fill(nome);
  await campo(page, "E-mail").fill("ana@exemplo.com");
  await campo(page, "Senha").fill("senha-forte");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Antes de começar, o combinado" })).toBeVisible();
}

test.describe("Entrada do aluno", () => {
  test("cadastro, termos, código da turma e boas-vindas", async ({ page }) => {
    await criarConta(page);
    const aceitar = page.getByRole("button", { name: "Aceitar e continuar" });
    await expect(aceitar).toBeDisabled();
    await campo(page, "Li e aceito os Termos de uso e a Política de privacidade.").check();
    await aceitar.click();

    await page.getByRole("link", { name: /Tenho um código de turma/ }).click();
    const codigo = campo(page, "Código da turma, 8 letras e números");
    // A14: código inválido
    await codigo.fill("ZZZZ-ZZZZ");
    await page.getByRole("button", { name: "Entrar na turma" }).click();
    await expect(alerta(page)).toHaveText(/Não encontramos uma turma com esse código/);
    await expect(codigo).toHaveAttribute("aria-invalid", "true");
    // código vencido (Y15)
    await codigo.fill("pq7k2mxz");
    await page.getByRole("button", { name: "Entrar na turma" }).click();
    await expect(alerta(page)).toHaveText(/O código desta turma venceu/);
    // Y16: com hífen e minúsculas
    await codigo.fill("pq7k-2mxa");
    await page.getByRole("button", { name: "Entrar na turma" }).click();
    await expect(page.getByRole("heading", { name: "Turma encontrada" })).toBeVisible();
    await expect(page.getByText("Ele nunca vê como você votou no Voto às Cegas.")).toBeVisible();

    await page.getByRole("link", { name: "Continuar" }).click();
    await expect(page.getByRole("heading", { name: "Aprenda do zero" })).toBeVisible();
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByRole("button", { name: "Próximo" }).click();
    await page.getByRole("link", { name: "Começar" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/perfil");
    await expect(page.getByRole("heading", { name: "Ana Teste" })).toBeVisible();
    await expect(page.getByText("1º ano A · Escola Estadual Exemplo")).toBeVisible();
  });

  test("5 códigos errados bloqueiam por 10 minutos (Y17)", async ({ page }) => {
    await criarConta(page);
    await campo(page, "Li e aceito os Termos de uso e a Política de privacidade.").check();
    await page.getByRole("button", { name: "Aceitar e continuar" }).click();
    await page.goto("/turma");
    const codigo = campo(page, "Código da turma, 8 letras e números");
    for (let i = 0; i < 5; i++) {
      await codigo.fill(`ERRADO0${i + 2}`);
      await page.getByRole("button", { name: "Entrar na turma" }).click();
      await expect(alerta(page)).toHaveText(/Não encontramos/);
    }
    await codigo.fill("PQ7K2MXA");
    await page.getByRole("button", { name: "Entrar na turma" }).click();
    await expect(alerta(page)).toHaveText(/daqui a 10 minutos/);
  });

  test("login com senha incorreta, recuperar e nova senha (A2, A15, A3, A4, A16)", async ({ page }) => {
    await criarConta(page);
    await page.goto("/perfil");
    await page.getByRole("button", { name: "Sair da conta" }).click();
    await page.getByRole("dialog", { name: "Sair da conta?" }).getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/abertura$/);

    await page.getByRole("link", { name: "Já tenho uma conta" }).click();
    await campo(page, "E-mail").fill("ana@exemplo.com");
    await campo(page, "Senha").fill("curta");
    await page.getByRole("button", { name: "Entrar" }).click();
    const senha = campo(page, "Senha");
    await expect(senha).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText("E-mail ou senha não conferem.", { exact: false })).toBeVisible();

    await page.getByRole("link", { name: "Esqueci minha senha" }).click();
    await campo(page, "E-mail").fill("ana@exemplo.com");
    await page.getByRole("button", { name: "Enviar link" }).click();
    await expect(page.getByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
    await page.getByRole("button", { name: "Reenviar e-mail" }).click();
    await expect(page.getByRole("status").filter({ hasText: "E-mail reenviado" })).toBeVisible();
    await page.getByRole("link", { name: "Já abri o link" }).click();

    await campo(page, "Senha nova").fill("nova-senha-1");
    await campo(page, "Repita a senha").fill("nova-senha-2");
    await expect(page.getByText("As duas senhas são iguais (ainda não)")).toBeAttached();
    await campo(page, "Repita a senha").fill("nova-senha-1");
    await expect(page.getByText("As duas senhas são iguais (cumprida)")).toBeAttached();
    await page.getByRole("button", { name: "Salvar senha" }).click();
    await expect(page).toHaveURL(/\/entrar$/);

    await campo(page, "E-mail").fill("ana@exemplo.com");
    await campo(page, "Senha").fill("nova-senha-1");
    await page.getByRole("button", { name: "Entrar" }).click();
    // os termos ainda não foram aceitos nesta conta
    await expect(page.getByRole("heading", { name: "Antes de começar, o combinado" })).toBeVisible();
  });

  test("editar o nome e apagar a conta (F10, F5, F12)", async ({ page }) => {
    await criarConta(page);
    await page.goto("/perfil/conta");
    await campo(page, "Nome").fill("Ana Nova");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Nome salvo." })).toBeVisible();

    await page.goto("/perfil/privacidade");
    await expect(page.getByText("Como você votou no Voto às Cegas")).toBeVisible();
    await page.getByRole("button", { name: "Apagar minha conta" }).click();
    const gaveta = page.getByRole("dialog", { name: "Apagar sua conta?" });
    await gaveta.getByRole("button", { name: "Apagar para sempre" }).click();
    await expect(page).toHaveURL(/\/abertura$/);
    const guardado = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    expect(guardado).not.toContain("Ana");
  });
});
