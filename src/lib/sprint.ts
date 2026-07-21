import "server-only";
import { db } from "@/lib/db";

export const ISTANBUL_SPRINT_START = "2026-07-21 00:00:00";
export const ISTANBUL_SPRINT_END = "2026-08-04 23:59:59";
export const DISTRICT_SIGNAL_GOAL = 30;

export type DistrictSprintMetric = {
  district: "Beyoğlu" | "Kadıköy";
  priceSignals: number;
  contributors: number;
  verifications: number;
  outdatedReports: number;
};

const DISTRICTS = ["Beyoğlu", "Kadıköy"] as const;

export function getIstanbulSprintMetrics(): DistrictSprintMetric[] {
  const query = db().prepare(
    `WITH price_events(user_id) AS (
       SELECT pr.user_id
         FROM price_reports pr JOIN pins p ON p.id = pr.pin_id
        WHERE p.district = ? AND pr.created_at >= ?
       UNION ALL
       SELECT p.user_id
         FROM pins p JOIN users u ON u.id = p.user_id
        WHERE p.district = ? AND p.created_at >= ?
          AND p.price IS NOT NULL AND u.name != 'Pinle Ekibi 📌'
     ),
     positive_votes(user_id) AS (
       SELECT v.user_id
         FROM votes v JOIN pins p ON p.id = v.pin_id
        WHERE p.district = ?
          AND COALESCE(v.updated_at, v.created_at) >= ?
          AND v.value = 1
     ),
     negative_votes(user_id) AS (
       SELECT v.user_id
         FROM votes v JOIN pins p ON p.id = v.pin_id
        WHERE p.district = ?
          AND COALESCE(v.updated_at, v.created_at) >= ?
          AND v.value = -1
     ),
     contributors(user_id) AS (
       SELECT user_id FROM price_events
       UNION SELECT user_id FROM positive_votes
       UNION SELECT user_id FROM negative_votes
     )
     SELECT
       (SELECT COUNT(*) FROM price_events) AS price_signals,
       (SELECT COUNT(*) FROM contributors) AS contributors,
       (SELECT COUNT(*) FROM positive_votes) AS verifications,
       (SELECT COUNT(*) FROM negative_votes) AS outdated_reports`
  );

  return DISTRICTS.map((district) => {
    const row = query.get(
      district,
      ISTANBUL_SPRINT_START,
      district,
      ISTANBUL_SPRINT_START,
      district,
      ISTANBUL_SPRINT_START,
      district,
      ISTANBUL_SPRINT_START
    ) as {
      price_signals: number;
      contributors: number;
      verifications: number;
      outdated_reports: number;
    };
    return {
      district,
      priceSignals: row.price_signals,
      contributors: row.contributors,
      verifications: row.verifications,
      outdatedReports: row.outdated_reports,
    };
  });
}
