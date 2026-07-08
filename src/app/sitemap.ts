import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const pins = db()
    .prepare(
      "SELECT id, created_at FROM pins WHERE status = 'active' ORDER BY created_at DESC LIMIT 1000"
    )
    .all() as { id: string; created_at: string }[];

  return [
    { url: `${BASE}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/liderler`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/gizlilik`, changeFrequency: "monthly", priority: 0.3 },
    ...pins.map((p) => ({
      url: `${BASE}/pin/${p.id}`,
      lastModified: new Date(p.created_at.replace(" ", "T") + "Z"),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
