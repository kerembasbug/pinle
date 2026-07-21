import { db } from "@/lib/db";
import { cleanEmbedSource, isEmbedTarget } from "@/lib/embedMarketing";
import { overloadGuard } from "@/lib/flags";

export async function POST(request: Request) {
  const guard = overloadGuard();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    source?: unknown;
    target?: unknown;
  } | null;
  if (!isEmbedTarget(body?.target)) {
    return Response.json({ error: "Geçersiz hedef" }, { status: 400 });
  }

  const source = cleanEmbedSource(body?.source);
  db().prepare("INSERT INTO embed_clicks (source, target) VALUES (?, ?)").run(source, body.target);
  return new Response(null, { status: 204 });
}
