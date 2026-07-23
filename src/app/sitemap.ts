import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CITIES, cityCatCombos } from "@/lib/cities";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

// Keep these dates tied to the latest significant page change. Do not replace
// them with the current time: Google only trusts consistently accurate lastmod
// values, and dynamic data pages below intentionally omit this field.
const STATIC_LAST_MODIFIED = {
  android: "2026-07-22T10:20:38.000Z",
  english: "2026-07-21T18:02:54.000Z",
  press: "2026-07-22T10:20:38.000Z",
  istanbulSprint: "2026-07-22T09:08:22.000Z",
  prices: "2026-07-23T15:04:39.000Z",
  methodology: "2026-07-22T10:20:38.000Z",
  tasks: "2026-07-22T08:35:17.000Z",
  campus: "2026-07-22T08:16:48.000Z",
  privacy: "2026-07-22T09:08:22.000Z",
} as const;

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
      lastModified: STATIC_LAST_MODIFIED.android,
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
      lastModified: STATIC_LAST_MODIFIED.english,
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
    {
      url: `${BASE}/basin`,
      lastModified: STATIC_LAST_MODIFIED.press,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${BASE}/sprint/istanbul`,
      lastModified: STATIC_LAST_MODIFIED.istanbulSprint,
      changeFrequency: "daily",
      priority: 0.85,
    },
    { url: `${BASE}/liderler`, changeFrequency: "daily", priority: 0.8 },
    {
      url: `${BASE}/fiyatlar`,
      lastModified: STATIC_LAST_MODIFIED.prices,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE}/metodoloji`,
      lastModified: STATIC_LAST_MODIFIED.methodology,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/gorevler`,
      lastModified: STATIC_LAST_MODIFIED.tasks,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE}/kampus`,
      lastModified: STATIC_LAST_MODIFIED.campus,
      changeFrequency: "weekly",
      priority: 0.8,
    },
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
    {
      url: `${BASE}/gizlilik`,
      lastModified: STATIC_LAST_MODIFIED.privacy,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...pins.map((p) => ({
      url: `${BASE}/pin/${p.id}`,
      lastModified: new Date(p.created_at.replace(" ", "T") + "Z"),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
