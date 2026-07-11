import { db } from "@/lib/db";

export async function GET() {
  const d = db();
  const allTime = d
    .prepare(
      `SELECT u.name, u.avatar, u.points,
        (SELECT COUNT(*) FROM pins p WHERE p.user_id = u.id AND p.status = 'active') AS pins
       FROM users u WHERE u.points > 0
       ORDER BY u.points DESC LIMIT 20`
    )
    .all();
  const weekly = d
    .prepare(
      `SELECT u.name, u.avatar, SUM(e.points) AS points,
        (SELECT COUNT(*) FROM pins p WHERE p.user_id = u.id AND p.status = 'active'
          AND p.created_at > datetime('now', '-7 day')) AS pins
       FROM points_events e JOIN users u ON u.id = e.user_id
       WHERE e.created_at > datetime('now', '-7 day')
       GROUP BY u.id ORDER BY points DESC LIMIT 20`
    )
    .all();
  return Response.json({ allTime, weekly });
}
