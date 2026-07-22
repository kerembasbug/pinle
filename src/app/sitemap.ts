import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CITIES, cityCatCombos } from "@/lib/cities";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const pins = db()
    .prepare(
      `SELECT id, created_at FROM pins
        WHERE status = 'active'
          AND (
            price IS NOT NULL
            OR length(trim(COALESCE(note, ''))) >= 80
            OR length(trim(COALESCE(photo, ''))) > 0
          )
        ORDER BY created_at DESC
        LIMIT 1000`
    )
    .all() as { id: string; created_at: string }[];

  return [
    { url: `${BASE}/`, changeFrequency: "hourly", priority: 1 },
    {
      url: `${BASE}/android`,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          "tr-TR": `${BASE}/android`,
          en: `${BASE}/en`,
          "x-default": `${BASE}/android`,
        },
      },
    },
    {
      url: `${BASE}/en`,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          "tr-TR": `${BASE}/android`,
          en: `${BASE}/en`,
          "x-default": `${BASE}/android`,
        },
      },
    },
    { url: `${BASE}/basin`, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/sprint/istanbul`, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE}/liderler`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/fiyatlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/metodoloji`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/gorevler`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/kampus`, changeFrequency: "weekly", priority: 0.8 },
    ...CITIES.map((c) => ({
      url: `${BASE}/sehir/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...cityCatCombos().map((c) => ({
      url: `${BASE}/sehir/${c.city}/${c.category}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/gizlilik`, changeFrequency: "monthly", priority: 0.3 },
    ...pins.map((p) => ({
      url: `${BASE}/pin/${p.id}`,
      lastModified: new Date(p.created_at.replace(" ", "T") + "Z"),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
