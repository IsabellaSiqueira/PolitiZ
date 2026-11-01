// Verificação semanal das leis publicadas (Y19). Roda pelo GitHub Actions (.github/workflows/leis-semanal.yml).
// Confere a situação de cada lei na fonte oficial; arquivada ou já transformada em lei sai do ar
// (publicada = false), e o banco tira a lei das sessões abertas. As outras só têm a situação atualizada.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run leis -- verificar
//
// Usa a chave de serviço, que nunca vai para o app: só existe como segredo do GitHub.
import { situacaoCamara } from "./camara.ts";
import { SITUACAO_FORA } from "./regras.ts";

type Lei = { id: string; fonte: string; id_externo: string; rotulo: string };
export type Resultado = { conferidas: number; despublicadas: { rotulo: string; situacao: string }[]; puladas: string[] };

export async function verificar(opcoes: {
  supabaseUrl: string;
  chave: string;
  situacao?: (lei: Lei) => Promise<string | null>;
  pausaMs?: number;
}): Promise<Resultado> {
  const cabecalhos = { apikey: opcoes.chave, Authorization: `Bearer ${opcoes.chave}`, "Content-Type": "application/json" };
  const rest = `${opcoes.supabaseUrl.replace(/\/$/, "")}/rest/v1`;
  const r = await fetch(`${rest}/leis?select=id,fonte,id_externo,rotulo&publicada=eq.true&order=rotulo`, { headers: cabecalhos });
  if (!r.ok) throw new Error(`Supabase respondeu ${r.status} ao listar as leis`);
  const leis = (await r.json()) as Lei[];
  const situacao = opcoes.situacao ?? ((l: Lei) => situacaoCamara(l.id_externo));

  const resultado: Resultado = { conferidas: 0, despublicadas: [], puladas: [] };
  for (const lei of leis) {
    // o Senado ainda não tem busca automática (leis/README.md); leis de exemplo não têm fonte
    if (lei.fonte !== "camara") {
      resultado.puladas.push(lei.rotulo);
      continue;
    }
    const s = await situacao(lei);
    const fora = !!s && SITUACAO_FORA.test(s);
    const corpo = { situacao: s, situacao_conferida_em: new Date().toISOString(), ...(fora ? { publicada: false } : {}) };
    const u = await fetch(`${rest}/leis?id=eq.${lei.id}`, { method: "PATCH", headers: cabecalhos, body: JSON.stringify(corpo) });
    if (!u.ok) throw new Error(`Supabase respondeu ${u.status} ao atualizar ${lei.rotulo}`);
    resultado.conferidas++;
    if (fora) resultado.despublicadas.push({ rotulo: lei.rotulo, situacao: s! });
    // a Câmara pede calma: uma consulta a cada 2 segundos
    if (opcoes.pausaMs !== 0) await new Promise((ok) => setTimeout(ok, opcoes.pausaMs ?? 2000));
  }
  return resultado;
}
