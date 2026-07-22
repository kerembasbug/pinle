import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import {
  acquisitionContextFromValues,
  isAcquisitionSurface,
} from "@/lib/acquisition";

export async function POST(request: Request) {
  const guard = overloadGuard();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    surface?: unknown;
    source?: unknown;
    medium?: unknown;
    campaign?: unknown;
    content?: unknown;
  } | null;
  const context = acquisitionContextFromValues(
    body?.source,
    body?.medium,
    body?.campaign,
    body?.content
  );
  if (!isAcquisitionSurface(body?.surface) || !context) {
    return Response.json({ error: "Geçersiz edinim olayı" }, { status: 400 });
  }

  db()
    .prepare(
      `INSERT INTO acquisition_events (surface, source, medium, campaign, content)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(body.surface, context.source, context.medium, context.campaign, context.content ?? null);
  return new Response(null, { status: 204 });
}
