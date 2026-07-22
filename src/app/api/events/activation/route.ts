import { db } from "@/lib/db";
import { overloadGuard } from "@/lib/flags";
import { isActivationAction, isActivationSource } from "@/lib/marketing";
import { acquisitionContextFromValues } from "@/lib/acquisition";

export async function POST(request: Request) {
  const guard = overloadGuard();
  if (guard) return guard;

  const body = (await request.json().catch(() => null)) as {
    source?: unknown;
    action?: unknown;
    acquisition_source?: unknown;
    acquisition_medium?: unknown;
    acquisition_campaign?: unknown;
    acquisition_content?: unknown;
  } | null;
  if (!isActivationSource(body?.source) || !isActivationAction(body?.action)) {
    return Response.json({ error: "Geçersiz aktivasyon olayı" }, { status: 400 });
  }

  const hasAcquisition =
    body?.acquisition_source != null ||
    body?.acquisition_medium != null ||
    body?.acquisition_campaign != null ||
    body?.acquisition_content != null;
  const acquisition = hasAcquisition
    ? acquisitionContextFromValues(
        body?.acquisition_source,
        body?.acquisition_medium,
        body?.acquisition_campaign,
        body?.acquisition_content
      )
    : null;
  if (hasAcquisition && !acquisition) {
    return Response.json({ error: "Geçersiz edinim bağlamı" }, { status: 400 });
  }

  db()
    .prepare(
      `INSERT INTO activation_events (
         source, action, acquisition_source, acquisition_medium,
         acquisition_campaign, acquisition_content
       ) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      body.source,
      body.action,
      acquisition?.source ?? null,
      acquisition?.medium ?? null,
      acquisition?.campaign ?? null,
      acquisition?.content ?? null
    );
  return new Response(null, { status: 204 });
}
