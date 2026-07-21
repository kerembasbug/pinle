import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { isShareSource } from "@/lib/marketing";

export async function POST(request: Request) {
  const guard = overloadGuard();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as { source?: unknown } | null;
  if (!isShareSource(body?.source)) {
    return Response.json({ error: "Geçersiz kaynak" }, { status: 400 });
  }

  db().prepare("INSERT INTO share_clicks (source) VALUES (?)").run(body.source);
  return new Response(null, { status: 204 });
}
