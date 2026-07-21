import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { isActivationAction, isActivationSource } from "@/lib/marketing";

export async function POST(request: Request) {
  const guard = overloadGuard();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    source?: unknown;
    action?: unknown;
  } | null;
  if (!isActivationSource(body?.source) || !isActivationAction(body?.action)) {
    return Response.json({ error: "Geçersiz aktivasyon olayı" }, { status: 400 });
  }

  db()
    .prepare("INSERT INTO activation_events (source, action) VALUES (?, ?)")
    .run(body.source, body.action);
  return new Response(null, { status: 204 });
}
