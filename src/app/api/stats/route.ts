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
         (SELECT COUNT(*) FROM users ru WHERE date(ru.referred_at) = dates.day) AS referral_bindings,
         (SELECT COUNT(*) FROM users ru
            WHERE ru.referred_by IS NOT NULL
              AND date((SELECT MIN(p.created_at) FROM pins p WHERE p.user_id = ru.id)) = dates.day
         ) AS referral_activations,
         (SELECT COUNT(*) FROM embed_clicks ec WHERE date(ec.created_at) = dates.day) AS embed_clicks,
         (SELECT COUNT(*) FROM outbound_clicks oc WHERE date(oc.created_at) = dates.day) AS play_clicks,
         (SELECT COUNT(*) FROM review_events re
            WHERE date(re.created_at) = dates.day AND re.action = 'shown') AS review_prompts,
         (SELECT COUNT(*) FROM review_events re
            WHERE date(re.created_at) = dates.day AND re.action = 'open_play') AS review_play_opens,
         (SELECT COUNT(*) FROM activation_events ae
            WHERE date(ae.created_at) = dates.day
              AND ae.action IN ('open_missing_price', 'start_new_pin')) AS activation_starts,
         (SELECT COUNT(*) FROM activation_events ae
            WHERE date(ae.created_at) = dates.day AND ae.action = 'completed') AS activation_completions,
         (SELECT COUNT(*) FROM acquisition_events aq
            WHERE date(aq.created_at) = dates.day) AS tagged_landings
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
        (SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL) AS referred_users,
        (SELECT COUNT(*) FROM users ru
          WHERE ru.referred_by IS NOT NULL
            AND EXISTS (SELECT 1 FROM pins p WHERE p.user_id = ru.id)) AS activated_referrals,
        (SELECT COUNT(*) FROM embed_clicks) AS embed_clicks,
        (SELECT COUNT(*) FROM outbound_clicks) AS outbound_play_clicks,
        (SELECT COUNT(*) FROM review_events WHERE action = 'shown') AS review_prompts,
        (SELECT COUNT(*) FROM review_events WHERE action = 'open_play') AS review_play_opens,
        (SELECT COUNT(*) FROM review_events WHERE action = 'dismissed') AS review_dismissals,
        (SELECT COUNT(*) FROM activation_events
          WHERE action IN ('open_missing_price', 'start_new_pin')) AS activation_starts,
        (SELECT COUNT(*) FROM activation_events WHERE action = 'completed') AS activation_completions,
        (SELECT COUNT(*) FROM acquisition_events) AS tagged_landings`
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
             AND u.name != 'Pinle Ekibi 📌') AS user_created_pins,
         (SELECT COUNT(*) FROM users ru
           WHERE ru.referred_at > datetime('now', '-7 day')) AS referral_bindings,
         (SELECT COUNT(*) FROM users ru
           WHERE ru.referred_by IS NOT NULL
             AND (SELECT MIN(p.created_at) FROM pins p WHERE p.user_id = ru.id)
                 > datetime('now', '-7 day')) AS referral_activations,
         (SELECT COUNT(*) FROM embed_clicks
           WHERE created_at > datetime('now', '-7 day')) AS embed_referrals,
         (SELECT COUNT(*) FROM review_events
           WHERE created_at > datetime('now', '-7 day') AND action = 'shown') AS review_prompts,
         (SELECT COUNT(*) FROM review_events
           WHERE created_at > datetime('now', '-7 day') AND action = 'open_play') AS review_play_opens,
         (SELECT COUNT(*) FROM review_events
           WHERE created_at > datetime('now', '-7 day') AND action = 'dismissed') AS review_dismissals,
         (SELECT COUNT(*) FROM activation_events
           WHERE created_at > datetime('now', '-7 day')
             AND action IN ('open_missing_price', 'start_new_pin')) AS activation_starts,
         (SELECT COUNT(*) FROM activation_events
           WHERE created_at > datetime('now', '-7 day') AND action = 'completed') AS activation_completions,
         (SELECT COUNT(*) FROM acquisition_events
           WHERE created_at > datetime('now', '-7 day')) AS tagged_landing_sessions`
    )
    .get() as {
    active_contributors: number;
    new_price_signals: number;
    price_verifications: number;
    outdated_reports: number;
    user_created_pins: number;
    referral_bindings: number;
    referral_activations: number;
    embed_referrals: number;
    review_prompts: number;
    review_play_opens: number;
    review_dismissals: number;
    activation_starts: number;
    activation_completions: number;
    tagged_landing_sessions: number;
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

  const embedBySource = d
    .prepare(
      `SELECT source, target, COUNT(*) AS clicks
         FROM embed_clicks
        WHERE created_at > datetime('now', '-30 day')
        GROUP BY source, target
        ORDER BY clicks DESC, source ASC, target ASC`
    )
    .all();

  const reviewByAction = d
    .prepare(
      `SELECT source, action, COUNT(*) AS events
         FROM review_events
        WHERE created_at > datetime('now', '-30 day')
        GROUP BY source, action
        ORDER BY events DESC, source ASC, action ASC`
    )
    .all();

  const activationByAction = d
    .prepare(
      `SELECT source, action, COUNT(*) AS events
         FROM activation_events
        WHERE created_at > datetime('now', '-30 day')
        GROUP BY source, action
        ORDER BY events DESC, source ASC, action ASC`
    )
    .all();

  const activationBySource = (
    d
      .prepare(
        `SELECT source,
                SUM(CASE WHEN action IN ('open_missing_price', 'start_new_pin') THEN 1 ELSE 0 END) AS starts,
                SUM(CASE WHEN action = 'completed' THEN 1 ELSE 0 END) AS completions
           FROM activation_events
          WHERE created_at > datetime('now', '-7 day')
          GROUP BY source
          ORDER BY starts DESC, source ASC`
      )
      .all() as { source: string; starts: number; completions: number }[]
  ).map((row) => ({
    ...row,
    completion_rate:
      row.starts > 0 ? Math.round((row.completions / row.starts) * 100) / 100 : null,
  }));

  const acquisitionByChannel = d
    .prepare(
      `SELECT surface, source, medium, campaign, content, COUNT(*) AS sessions
         FROM acquisition_events
        WHERE created_at > datetime('now', '-30 day')
        GROUP BY surface, source, medium, campaign, content
        ORDER BY sessions DESC, surface ASC, source ASC, content ASC`
    )
    .all();

  const activationByAcquisition = (
    d
      .prepare(
        `SELECT acquisition_source AS acquisition_source,
                acquisition_medium AS acquisition_medium,
                acquisition_campaign AS acquisition_campaign,
                acquisition_content AS acquisition_content,
                source AS activation_source,
                SUM(CASE WHEN action IN ('open_missing_price', 'start_new_pin') THEN 1 ELSE 0 END) AS starts,
                SUM(CASE WHEN action = 'completed' THEN 1 ELSE 0 END) AS completions
           FROM activation_events
          WHERE created_at > datetime('now', '-7 day')
            AND acquisition_source IS NOT NULL
          GROUP BY acquisition_source, acquisition_medium, acquisition_campaign,
                   acquisition_content, source
          ORDER BY starts DESC, acquisition_source ASC, activation_source ASC`
      )
      .all() as {
        acquisition_source: string;
        acquisition_medium: string;
        acquisition_campaign: string;
        acquisition_content: string | null;
        activation_source: string;
        starts: number;
        completions: number;
      }[]
  ).map((row) => ({
    ...row,
    completion_rate:
      row.starts > 0 ? Math.round((row.completions / row.starts) * 100) / 100 : null,
  }));

  const acquisitionFunnel = (
    d
      .prepare(
        `WITH landings AS (
           SELECT source, medium, campaign, content, COUNT(*) AS sessions
             FROM acquisition_events
            WHERE created_at > datetime('now', '-7 day')
            GROUP BY source, medium, campaign, content
         ), activations AS (
           SELECT acquisition_source AS source,
                  acquisition_medium AS medium,
                  acquisition_campaign AS campaign,
                  acquisition_content AS content,
                  SUM(CASE WHEN action IN ('open_missing_price', 'start_new_pin') THEN 1 ELSE 0 END) AS starts,
                  SUM(CASE WHEN action = 'completed' THEN 1 ELSE 0 END) AS completions
             FROM activation_events
            WHERE created_at > datetime('now', '-7 day')
              AND acquisition_source IS NOT NULL
            GROUP BY acquisition_source, acquisition_medium,
                     acquisition_campaign, acquisition_content
         ), channels AS (
           SELECT source, medium, campaign, content FROM landings
           UNION
           SELECT source, medium, campaign, content FROM activations
         )
         SELECT channels.source, channels.medium, channels.campaign, channels.content,
                COALESCE(landings.sessions, 0) AS sessions,
                COALESCE(activations.starts, 0) AS starts,
                COALESCE(activations.completions, 0) AS completions
           FROM channels
           LEFT JOIN landings
             ON landings.source = channels.source
            AND landings.medium = channels.medium
            AND landings.campaign = channels.campaign
            AND landings.content IS channels.content
           LEFT JOIN activations
             ON activations.source = channels.source
            AND activations.medium = channels.medium
            AND activations.campaign = channels.campaign
            AND activations.content IS channels.content
          ORDER BY starts DESC, sessions DESC, channels.source ASC, channels.content ASC`
      )
      .all() as {
        source: string;
        medium: string;
        campaign: string;
        content: string | null;
        sessions: number;
        starts: number;
        completions: number;
      }[]
  ).map((row) => ({
    ...row,
    start_rate:
      row.sessions > 0 ? Math.round((row.starts / row.sessions) * 100) / 100 : null,
    completion_rate:
      row.starts > 0 ? Math.round((row.completions / row.starts) * 100) / 100 : null,
  }));

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
  const reviewOpenRate =
    launchMetrics.review_prompts > 0
      ? Math.round((launchMetrics.review_play_opens / launchMetrics.review_prompts) * 100) / 100
      : null;
  const activationCompletionRate =
    launchMetrics.activation_starts > 0
      ? Math.round(
          (launchMetrics.activation_completions / launchMetrics.activation_starts) * 100
        ) / 100
      : null;

  return Response.json({
    totals,
    byKind,
    playBySource,
    shareBySource,
    embedBySource,
    reviewByAction,
    activationByAction,
    activationBySource,
    acquisitionByChannel,
    activationByAcquisition,
    acquisitionFunnel,
    last14Days: days,
    launchMetrics: {
      ...launchMetrics,
      weekly_visitors: contribution.weekly_visitors,
      contribution_rate: launchContributionRate,
      review_open_rate: reviewOpenRate,
      activation_completion_rate: activationCompletionRate,
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
