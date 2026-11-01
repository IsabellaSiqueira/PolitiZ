import { expect, test } from "@playwright/test";
import { modulo } from "../../src/data/trilha";
import { alternativa, comProgresso, fazerQuiz } from "./apoio";

const [aula1, aula2] = modulo.aulas;

test.describe("Trilha, aulas e quiz", () => {
  test("as aulas liberam em sequência: leitura e quiz com 70% (Y3)", async ({ page }) => {
    await comProgresso(page, { entradaVista: true });
    await page.goto("/trilhas");
    await expect(page.getByRole("link", { name: new RegExp(aula1.titulo) })).toBeVisible();
    // a aula 2 aparece, mas sem link, até a 1 ser concluída
    await expect(page.getByRole("link", { name: new RegExp(aula2.titulo) })).toHaveCount(0);
    await expect(page.getByText("Libera depois da aula 1")).toBeVisible();

    await page.goto(`/aula/${aula2.id}`);
    await expect(page.getByText(`Esta aula libera depois que você concluir a aula 1, ${aula1.titulo}.`)).toBeVisible();

    await page.goto(`/aula/${aula1.id}`);
    await page.getByRole("button", { name: "Marcar como concluída" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Aula concluída" })).toBeVisible();

    // só ler não basta: falta o quiz com 70%; a aula bloqueada abre a gaveta (C10)
    await page.goto("/trilhas");
    await expect(page.getByText("Libera com 70% no quiz da aula 1")).toBeVisible();
    await page.getByRole("button", { name: new RegExp(aula2.titulo) }).click();
    const gaveta = page.getByRole("dialog", { name: "Essa aula ainda está bloqueada" });
    await expect(gaveta).toBeVisible();
    await expect(gaveta.getByRole("link", { name: "Fazer o quiz da aula 1" })).toBeVisible();
    await gaveta.getByRole("button", { name: "Agora não" }).click();
    await expect(gaveta).toBeHidden();

    // abaixo de 70% continua fechada (4 perguntas: 2 erros = 50%)
    await fazerQuiz(page, aula1, 2);
    await expect(page.getByText(/Para liberar a próxima aula, acerte pelo menos 3 de 4 \(70%\)\. Faltou 1 acerto\./)).toBeVisible();
    await expect(page.getByRole("button", { name: "Refazer o quiz" })).toBeVisible();
    await page.goto("/trilhas");
    await expect(page.getByRole("link", { name: new RegExp(aula2.titulo) })).toHaveCount(0);

    await fazerQuiz(page, aula1, 0);
    await expect(page.getByText("Você chegou aos 70%. A aula 2 está liberada.")).toBeVisible();
    await page.goto("/trilhas");
    await expect(page.getByRole("link", { name: new RegExp(aula2.titulo) })).toBeVisible();
  });

  test("o quiz só abre depois da leitura", async ({ page }) => {
    await page.goto(`/quiz/${aula1.id}`);
    await expect(page.getByText("Leia a aula e marque como concluída antes de fazer o quiz.")).toBeVisible();
  });

  test("quiz com marcar e confirmar, explicação, resultado e histórico", async ({ page }) => {
    await comProgresso(page, { aulasConcluidas: [aula1.id] });
    await page.goto(`/quiz/${aula1.id}`);

    let acertos = 0;
    for (let i = 0; i < aula1.perguntas.length; i++) {
      const titulo = (await page.locator("main h1").textContent())!.trim();
      const p = aula1.perguntas.find((q) => titulo.startsWith(q.enunciado.slice(0, 20)))!;
      // Y4: as letras seguem a posição na tela, porque as alternativas são embaralhadas
      await expect(page.locator("fieldset button")).toHaveText([/^A/, /^B/, /^C/, /^D/]);
      const certa = p.alternativas.find((a) => a.letra === p.correta)!;
      const errada = p.alternativas.find((a) => a.letra !== p.correta)!;
      await alternativa(page, (i === 0 ? errada : certa).texto).click();
      // marcar não responde: só o botão confirma (D10)
      await expect(page.getByText(p.explicacao)).toHaveCount(0);
      await page.getByRole("button", { name: "Responder" }).click();
      if (i === 0) {
        const letraCerta = ((await alternativa(page, certa.texto).textContent()) ?? "").trim()[0];
        await expect(page.getByText(`A resposta é a ${letraCerta}`)).toBeVisible();
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
    await expect(page.getByRole("heading", { name: `Você acertou ${acertos} de ${total}` })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vale revisar" })).toBeVisible();

    // pode ser refeito, e cada tentativa fica no histórico
    await page.getByRole("button", { name: "Refazer o quiz" }).click();
    await expect(page.getByRole("button", { name: "Responder" })).toBeVisible();

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
