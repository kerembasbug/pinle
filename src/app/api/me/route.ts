import { db, recordVisit } from "@/lib/db";
import { getOrCreateUser } from "@/lib/identity";
import { badgesFor } from "@/lib/gamify";

export async function GET() {
  const user = await getOrCreateUser();
  const d = db();
  recordVisit(user.id);
  const urow = d.prepare("SELECT points, email FROM users WHERE id = ?").get(user.id) as {
    points: number;
    email: string | null;
  };
  const points = urow.points;
  const pinCount = (
    d.prepare("SELECT COUNT(*) AS c FROM pins WHERE user_id = ? AND status = 'active'").get(user.id) as { c: number }
  ).c;

  // Haftanın Muhtarı: son 7 günün puan toplamında 1. sıra
  const weeklyPoints = (
    d
      .prepare(
        "SELECT COALESCE(SUM(points), 0) AS s FROM points_events WHERE user_id = ? AND created_at > datetime('now', '-7 day')"
      )
      .get(user.id) as { s: number }
  ).s;
  let weeklyRank: number | null = null;
  if (weeklyPoints > 0) {
    const better = (
      d
        .prepare(
          `SELECT COUNT(*) AS c FROM (
             SELECT user_id, SUM(points) AS s FROM points_events
             WHERE created_at > datetime('now', '-7 day')
             GROUP BY user_id HAVING s > ?
           )`
        )
        .get(weeklyPoints) as { c: number }
    ).c;
    weeklyRank = better + 1;
  }

  return Response.json({
    name: user.name,
    points,
    pinCount,
    weeklyPoints,
    weeklyRank,
    isMuhtar: weeklyRank === 1,
    email: urow.email,
    badges: badgesFor(user.id),
  });
}
