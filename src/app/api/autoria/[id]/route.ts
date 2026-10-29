import { buscarAutoria } from "@/lib/camara";
import { autoriaExemplo, ehExemplo } from "@/data/leis";

/**
 * Revela autoria e partido de uma lei.
 * Só é chamada depois que a pessoa vota, para que essa informação
 * nunca esteja no aparelho antes da decisão.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/autoria/[id]">) {
  const { id } = await ctx.params;

  if (ehExemplo(id)) {
    const a = autoriaExemplo(id);
    return a ? Response.json(a) : Response.json({ erro: "Lei não encontrada" }, { status: 404 });
  }

  if (!/^\d{1,9}$/.test(id)) return Response.json({ erro: "Identificador inválido" }, { status: 400 });

  try {
    return Response.json(await buscarAutoria(id));
  } catch {
    return Response.json({ erro: "Não foi possível consultar a Câmara agora" }, { status: 502 });
  }
}
