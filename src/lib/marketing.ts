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
  "campus_play",
] as const;

export type PlaySource = (typeof PLAY_SOURCES)[number];

export function isPlaySource(value: unknown): value is PlaySource {
  return typeof value === "string" && PLAY_SOURCES.includes(value as PlaySource);
}

export const SHARE_SOURCES = [
  "sprint_whatsapp",
  "sprint_x",
  "task_board_whatsapp",
  "task_board_x",
  "task_detail_whatsapp",
  "task_detail_x",
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

export const ACTIVATION_SOURCES = [
  "first_contribution_mission",
  "seo_city",
  "seo_city_category",
  "task_board",
  "campus",
  "shared_task",
] as const;
export const ACTIVATION_ACTIONS = ["open_missing_price", "start_new_pin", "completed"] as const;

export type ActivationSource = (typeof ACTIVATION_SOURCES)[number];
export type ActivationAction = (typeof ACTIVATION_ACTIONS)[number];

export function isActivationSource(value: unknown): value is ActivationSource {
  return typeof value === "string" && ACTIVATION_SOURCES.includes(value as ActivationSource);
}

export function isActivationAction(value: unknown): value is ActivationAction {
  return typeof value === "string" && ACTIVATION_ACTIONS.includes(value as ActivationAction);
}
