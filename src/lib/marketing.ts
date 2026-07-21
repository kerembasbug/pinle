export const PLAY_SOURCES = [
  "android_hero",
  "android_bottom",
  "en_hero",
  "en_bottom",
  "sprint_istanbul_hero",
  "sprint_istanbul_bottom",
  "basin_play",
  "pin_share_play",
  "pin_detail_play",
  "install_banner",
] as const;

export type PlaySource = (typeof PLAY_SOURCES)[number];

export function isPlaySource(value: unknown): value is PlaySource {
  return typeof value === "string" && PLAY_SOURCES.includes(value as PlaySource);
}

export const SHARE_SOURCES = [
  "sprint_whatsapp",
  "sprint_x",
  "profile_invite",
  "pin_share",
] as const;

export type ShareSource = (typeof SHARE_SOURCES)[number];

export function isShareSource(value: unknown): value is ShareSource {
  return typeof value === "string" && SHARE_SOURCES.includes(value as ShareSource);
}

export const REVIEW_SOURCES = ["post_contribution"] as const;
export const REVIEW_ACTIONS = ["shown", "open_play", "dismissed"] as const;

export type ReviewSource = (typeof REVIEW_SOURCES)[number];
export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export function isReviewSource(value: unknown): value is ReviewSource {
  return typeof value === "string" && REVIEW_SOURCES.includes(value as ReviewSource);
}

export function isReviewAction(value: unknown): value is ReviewAction {
  return typeof value === "string" && REVIEW_ACTIONS.includes(value as ReviewAction);
}
