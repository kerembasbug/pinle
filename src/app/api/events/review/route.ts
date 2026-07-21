import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { isReviewAction, isReviewSource } from "@/lib/marketing";

export async function POST(request: Request) {
  const guard = overloadGuard();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    source?: unknown;
    action?: unknown;
  } | null;
  if (!isReviewSource(body?.source) || !isReviewAction(body?.action)) {
    return Response.json({ error: "Geçersiz değerlendirme olayı" }, { status: 400 });
  }

  db()
    .prepare("INSERT INTO review_events (source, action) VALUES (?, ?)")
    .run(body.source, body.action);
  return new Response(null, { status: 204 });
}
