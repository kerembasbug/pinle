export const PLAY_SOURCES = [
  "android_hero",
  "android_bottom",
  "en_hero",
  "en_bottom",
] as const;

export type PlaySource = (typeof PLAY_SOURCES)[number];

export function isPlaySource(value: unknown): value is PlaySource {
  return typeof value === "string" && PLAY_SOURCES.includes(value as PlaySource);
}
