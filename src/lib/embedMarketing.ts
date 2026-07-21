export const EMBED_TARGETS = ["home", "pin"] as const;

export type EmbedTarget = (typeof EMBED_TARGETS)[number];

export function cleanEmbedSource(value: unknown): string {
  if (typeof value !== "string") return "publisher";
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9_-]{0,39}$/.test(normalized) ? normalized : "publisher";
}

export function isEmbedTarget(value: unknown): value is EmbedTarget {
  return typeof value === "string" && EMBED_TARGETS.includes(value as EmbedTarget);
}

export function attributedEmbedPath(path: string, source: string): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: "embed",
    utm_campaign: "publisher_widget",
  });
  return `${path}?${params}`;
}
