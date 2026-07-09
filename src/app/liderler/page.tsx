import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Liderlik Tablosu — Pinle" };
export const dynamic = "force-dynamic";

type Row = { name: string; points: number; pins: number };

const MEDALS = ["🥇", "🥈", "🥉"];

function Board({ title, rows, crown }: { title: string; rows: Row[]; crown?: boolean }) {
  return (
    <section className="w-full max-w-sm">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-2 flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="sticker-flat px-3 py-3 text-sm opacity-60">Henüz kimse yok — ilk sen ol!</p>
        )}
        {rows.map((r, i) => (
          <div
            key={r.name + i}
            className={`sticker-flat flex items-center gap-3 px-3 py-2.5 ${
              crown && i === 0 ? "bg-mustard" : "bg-cream"
            }`}
          >
            <span className="w-8 text-center text-lg font-extrabold">{MEDALS[i] ?? i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-bold">
                {r.name}
                {crown && i === 0 && (
                  <span className="ml-1.5 text-[11px] font-extrabold text-tomato">👑 Haftanın Muhtarı</span>
                )}
              </p>
              <p className="text-xs opacity-60">📌 {r.pins} pin</p>
            </div>
            <span className="display font-extrabold text-tomato">⭐ {r.points}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

type DistrictRow = { district: string; pins: number; week: number };

function DistrictBoard({
  rows,
  title = "🏙️ İlçe Ligi",
  subtitle = "Hangi ilçe haritayı daha çok dolduruyor?",
}: {
  rows: DistrictRow[];
  title?: string;
  subtitle?: string;
}) {
  const max = rows[0]?.pins ?? 1;
  return (
    <section className="w-full max-w-sm">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="text-xs opacity-60">{subtitle}</p>
      <div className="mt-2 flex flex-col gap-2">
        {rows.length === 0 && (
          <p className="sticker-flat px-3 py-3 text-sm opacity-60">Henüz pin yok.</p>
        )}
        {rows.map((r, i) => (
          <div key={r.district} className="sticker-flat px-3 py-2.5 bg-cream">
            <div className="flex items-center gap-3">
              <span className="w-8 text-center text-lg font-extrabold">{MEDALS[i] ?? i + 1}</span>
              <p className="flex-1 text-sm font-bold">
                {r.district}
                {i === 0 && <span className="ml-1.5">👑</span>}
              </p>
              <span className="display font-extrabold text-tomato">📌 {r.pins}</span>
            </div>
            <div className="ml-11 mt-1 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full border border-ink/20 bg-paper overflow-hidden">
                <div
                  className="h-full rounded-full bg-mustard"
                  style={{ width: `${Math.max(6, (r.pins / max) * 100)}%` }}
                />
              </div>
              {r.week > 0 && <span className="text-[11px] font-bold text-teal">+{r.week} bu hafta</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Leaderboard() {
  const d = db();
  const cities = d
    .prepare(
      `SELECT city AS district, COUNT(*) AS pins,
        SUM(CASE WHEN created_at > datetime('now', '-7 day') THEN 1 ELSE 0 END) AS week
       FROM pins WHERE status = 'active' AND city IS NOT NULL AND city != '-'
       GROUP BY city ORDER BY pins DESC, week DESC LIMIT 10`
    )
    .all() as DistrictRow[];
  const districts = d
    .prepare(
      `SELECT district, COUNT(*) AS pins,
        SUM(CASE WHEN created_at > datetime('now', '-7 day') THEN 1 ELSE 0 END) AS week
       FROM pins WHERE status = 'active' AND district IS NOT NULL AND district != '-'
       GROUP BY district ORDER BY pins DESC, week DESC LIMIT 10`
    )
    .all() as DistrictRow[];
  const allTime = d
    .prepare(
      `SELECT u.name, u.points,
        (SELECT COUNT(*) FROM pins p WHERE p.user_id = u.id AND p.status = 'active') AS pins
       FROM users u WHERE u.points > 0 ORDER BY u.points DESC LIMIT 20`
    )
    .all() as Row[];
  const weekly = d
    .prepare(
      `SELECT u.name, SUM(e.points) AS points,
        (SELECT COUNT(*) FROM pins p WHERE p.user_id = u.id AND p.status = 'active'
          AND p.created_at > datetime('now', '-7 day')) AS pins
       FROM points_events e JOIN users u ON u.id = e.user_id
       WHERE e.created_at > datetime('now', '-7 day')
       GROUP BY u.id ORDER BY points DESC LIMIT 20`
    )
    .all() as Row[];

  return (
    <main className="paper-grain flex min-h-dvh flex-col items-center gap-6 p-5 pb-10">
      <Link href="/" className="mt-2 flex items-center gap-1.5">
        <span className="text-2xl">📍</span>
        <span className="display text-2xl font-extrabold text-tomato">Pinle</span>
      </Link>
      <h1 className="text-2xl font-extrabold">🏆 Liderlik Tablosu</h1>
      {cities.length > 1 && (
        <DistrictBoard
          rows={cities}
          title="🏙️ Şehir Ligi"
          subtitle="Hangi şehir haritayı daha çok dolduruyor?"
        />
      )}
      <DistrictBoard rows={districts} />
      <Board title="Bu Hafta" rows={weekly} crown />
      <Board title="Tüm Zamanlar" rows={allTime} />
      <Link href="/" className="btn btn-tomato px-8 py-3">
        Haritaya Dön 🗺️
      </Link>
    </main>
  );
}
