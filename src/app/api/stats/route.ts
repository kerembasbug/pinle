import { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

// Basit iç analytics — KPI takibi için. PINLE_ADMIN_TOKEN env değişkeniyle korunur.
// Kullanım: GET /api/stats?token=<PINLE_ADMIN_TOKEN>

// Sabit-zamanlı token karşılaştırması (timing attack yüzeyini kapatır).
function tokenOk(given: string | null, expected: string | undefined): boolean {
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!tokenOk(token, process.env.PINLE_ADMIN_TOKEN)) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const d = db();
  const days = d
    .prepare(
      `WITH RECURSIVE dates(day) AS (
         SELECT date('now', '-13 day')
         UNION ALL SELECT date(day, '+1 day') FROM dates WHERE day < date('now')
       )
       SELECT dates.day,
         (SELECT COUNT(*) FROM visits v WHERE v.day = dates.day) AS visitors,
         (SELECT COUNT(*) FROM pins p WHERE date(p.created_at) = dates.day) AS pins,
         (SELECT COUNT(*) FROM users u WHERE date(u.created_at) = dates.day) AS new_users,
         (SELECT COUNT(*) FROM votes vt WHERE date(vt.created_at) = dates.day) AS votes,
         (SELECT COUNT(*) FROM comments c WHERE date(c.created_at) = dates.day) AS comments,
         (SELECT COUNT(*) FROM outbound_clicks oc WHERE date(oc.created_at) = dates.day) AS play_clicks
       FROM dates ORDER BY dates.day`
    )
    .all();

  const totals = d
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM pins WHERE status = 'active') AS pins,
        (SELECT COUNT(*) FROM pins WHERE status = 'hidden') AS hidden_pins,
        (SELECT COUNT(*) FROM votes) AS votes,
        (SELECT COUNT(*) FROM comments) AS comments,
        (SELECT COUNT(*) FROM reports) AS reports,
        (SELECT COUNT(*) FROM outbound_clicks) AS outbound_play_clicks`
    )
    .get();

  const byKind = d
    .prepare("SELECT kind, COUNT(*) AS c FROM pins WHERE status = 'active' GROUP BY kind")
    .all();

  const playBySource = d
    .prepare(
      `SELECT source, COUNT(*) AS clicks
         FROM outbound_clicks
        WHERE created_at > datetime('now', '-30 day')
        GROUP BY source
        ORDER BY clicks DESC, source ASC`
    )
    .all();

  // Katkı oranı: son 7 günün ziyaretçilerinden pin ekleyenlerin payı (launch KPI'sı)
  const contribution = d
    .prepare(
      `SELECT
        (SELECT COUNT(DISTINCT user_id) FROM visits WHERE day > date('now', '-7 day')) AS weekly_visitors,
        (SELECT COUNT(DISTINCT user_id) FROM pins WHERE created_at > datetime('now', '-7 day')) AS weekly_pinners`
    )
    .get() as { weekly_visitors: number; weekly_pinners: number };

  return Response.json({
    totals,
    byKind,
    playBySource,
    last14Days: days,
    contributionRate:
      contribution.weekly_visitors > 0
        ? Math.round((contribution.weekly_pinners / contribution.weekly_visitors) * 100) / 100
        : null,
    ...contribution,
  });
}
