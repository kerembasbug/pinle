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
         (SELECT COUNT(*) FROM votes vt
            WHERE date(COALESCE(vt.updated_at, vt.created_at)) = dates.day) AS votes,
         (SELECT COUNT(*) FROM price_reports pr WHERE date(pr.created_at) = dates.day)
           + (SELECT COUNT(*) FROM pins p JOIN users u ON u.id = p.user_id
                WHERE date(p.created_at) = dates.day AND p.price IS NOT NULL
                  AND u.name != 'Pinle Ekibi 📌') AS price_signals,
         (SELECT COUNT(*) FROM votes vt
            WHERE date(COALESCE(vt.updated_at, vt.created_at)) = dates.day
              AND vt.value = 1) AS price_verifications,
         (SELECT COUNT(*) FROM votes vt
            WHERE date(COALESCE(vt.updated_at, vt.created_at)) = dates.day
              AND vt.value = -1) AS outdated_reports,
         (SELECT COUNT(*) FROM (
            SELECT p.user_id FROM pins p JOIN users u ON u.id = p.user_id
             WHERE date(p.created_at) = dates.day AND u.name != 'Pinle Ekibi 📌'
            UNION
            SELECT pr.user_id FROM price_reports pr WHERE date(pr.created_at) = dates.day
            UNION
            SELECT vt.user_id FROM votes vt
             WHERE date(COALESCE(vt.updated_at, vt.created_at)) = dates.day
          )) AS active_contributors,
         (SELECT COUNT(*) FROM comments c WHERE date(c.created_at) = dates.day) AS comments,
         (SELECT COUNT(*) FROM share_clicks sc WHERE date(sc.created_at) = dates.day) AS shares,
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
        (SELECT COUNT(*) FROM price_reports) AS community_price_reports,
        (SELECT COUNT(*) FROM pins WHERE status = 'active' AND price IS NOT NULL) AS priced_pins,
        (SELECT COUNT(DISTINCT pin_id) FROM votes WHERE value = 1) AS community_confirmed_pins,
        (SELECT COUNT(*) FROM comments) AS comments,
        (SELECT COUNT(*) FROM reports) AS reports,
        (SELECT COUNT(*) FROM share_clicks) AS share_clicks,
        (SELECT COUNT(*) FROM outbound_clicks) AS outbound_play_clicks`
    )
    .get();

  const byKind = d
    .prepare("SELECT kind, COUNT(*) AS c FROM pins WHERE status = 'active' GROUP BY kind")
    .all();

  // Launch kampanyasının gerçek kullanıcı sinyalleri. OSM/ekip seed pinleri
  // kapsam ve keşif sağlar ama aktivasyon sayılmaz; fiyat bildirimi, doğrulama
  // veya ekip dışı yeni pin atan tekil kullanıcılar katkıcıdır.
  const launchMetrics = d
    .prepare(
      `WITH contributors(user_id) AS (
         SELECT p.user_id
           FROM pins p JOIN users u ON u.id = p.user_id
          WHERE p.created_at > datetime('now', '-7 day')
            AND u.name != 'Pinle Ekibi 📌'
         UNION
         SELECT pr.user_id FROM price_reports pr
          WHERE pr.created_at > datetime('now', '-7 day')
         UNION
         SELECT vt.user_id FROM votes vt
          WHERE COALESCE(vt.updated_at, vt.created_at) > datetime('now', '-7 day')
       )
       SELECT
         (SELECT COUNT(*) FROM contributors) AS active_contributors,
         (SELECT COUNT(*) FROM price_reports
           WHERE created_at > datetime('now', '-7 day'))
           + (SELECT COUNT(*) FROM pins p JOIN users u ON u.id = p.user_id
               WHERE p.created_at > datetime('now', '-7 day')
                 AND p.price IS NOT NULL AND u.name != 'Pinle Ekibi 📌') AS new_price_signals,
         (SELECT COUNT(*) FROM votes
           WHERE COALESCE(updated_at, created_at) > datetime('now', '-7 day')
             AND value = 1) AS price_verifications,
         (SELECT COUNT(*) FROM votes
           WHERE COALESCE(updated_at, created_at) > datetime('now', '-7 day')
             AND value = -1) AS outdated_reports,
         (SELECT COUNT(*) FROM pins p JOIN users u ON u.id = p.user_id
           WHERE p.created_at > datetime('now', '-7 day')
             AND u.name != 'Pinle Ekibi 📌') AS user_created_pins`
    )
    .get() as {
    active_contributors: number;
    new_price_signals: number;
    price_verifications: number;
    outdated_reports: number;
    user_created_pins: number;
  };

  const districtSignals = d
    .prepare(
      `WITH signals(city, district, user_id) AS (
         SELECT p.city, p.district, pr.user_id
           FROM price_reports pr JOIN pins p ON p.id = pr.pin_id
          WHERE pr.created_at > datetime('now', '-7 day')
         UNION ALL
         SELECT p.city, p.district, p.user_id
           FROM pins p JOIN users u ON u.id = p.user_id
          WHERE p.created_at > datetime('now', '-7 day')
            AND p.price IS NOT NULL AND u.name != 'Pinle Ekibi 📌'
       )
       SELECT city, district, COUNT(*) AS price_signals,
              COUNT(DISTINCT user_id) AS contributors
         FROM signals
        WHERE city IS NOT NULL AND city != '-'
          AND district IS NOT NULL AND district != '-'
        GROUP BY city, district
        ORDER BY price_signals DESC, contributors DESC, district ASC
        LIMIT 20`
    )
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

  const shareBySource = d
    .prepare(
      `SELECT source, COUNT(*) AS clicks
         FROM share_clicks
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

  const launchContributionRate =
    contribution.weekly_visitors > 0
      ? Math.round((launchMetrics.active_contributors / contribution.weekly_visitors) * 100) / 100
      : null;

  return Response.json({
    totals,
    byKind,
    playBySource,
    shareBySource,
    last14Days: days,
    launchMetrics: {
      ...launchMetrics,
      weekly_visitors: contribution.weekly_visitors,
      contribution_rate: launchContributionRate,
      district_signals: districtSignals,
      window_days: 7,
      seed_policy: "Pinle Ekibi 📌 pins excluded from contributor and new-price-signal counts",
    },
    contributionRate:
      contribution.weekly_visitors > 0
        ? Math.round((contribution.weekly_pinners / contribution.weekly_visitors) * 100) / 100
        : null,
    ...contribution,
  });
}
