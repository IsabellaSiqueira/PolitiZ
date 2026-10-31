import { defineConfig, devices } from "@playwright/test";

const PORTA_APP = 3100;
const PORTA_CAMARA = 4010;

/**
 * Testes de ponta a ponta e de acessibilidade.
 * O app roda em modo produção apontando para uma Câmara simulada (tests/camara-simulada.mjs),
 * então os testes não dependem da internet nem das leis do dia.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORTA_APP}`,
    // o app é pensado para o celular do aluno
    ...devices["Desktop Chrome"],
    viewport: { width: 390, height: 844 },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `node tests/camara-simulada.mjs`,
      env: { PORTA: String(PORTA_CAMARA) },
      port: PORTA_CAMARA,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npx next start -p ${PORTA_APP}`,
      env: { CAMARA_API_URL: `http://127.0.0.1:${PORTA_CAMARA}` },
      url: `http://127.0.0.1:${PORTA_APP}`,
      timeout: 240_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
