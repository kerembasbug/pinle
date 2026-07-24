export const ACQUISITION_SURFACES = [
  "home",
  "android",
  "en",
  "sprint_istanbul",
  "campus",
  "task_board",
  "shared_task",
  "pin_detail",
  "methodology",
] as const;

export const ACQUISITION_SOURCES = [
  "pinle",
  "instagram",
  "whatsapp",
  "x",
  "linkedin",
  "reddit",
  "reddit_turkdev",
  "reddit_sideproject",
  "producthunt",
  "earned_media",
  "offline",
  "outreach_email",
  "founder_network",
  "gazete_kadikoy",
  "pera_yasam",
  "beyoglu_dernegi",
  "bilgi_clubs",
  "bilgi_uni",
  "kampus_haber",
  "rotabu",
  "explore_kadikoy",
  "kahve_mekanlari",
  "my_turkey_adventure",
  "oggusto",
  "plumemag",
  "shiftdelete",
  "webtekno",
  "github_repo",
  "betalist",
  "uneed",
  "microlaunch",
  "sprint_contributor",
  "gsu_gastronomi",
  "ozu_cuisine",
  "yeditepe_gastroyunica",
  "publisher",
  "pin_share",
  "referral",
  "seo_city",
  "seo_city_category",
  "task_board",
  "campus",
  "shared_task",
] as const;

export const ACQUISITION_MEDIUMS = [
  "owned",
  "organic",
  "organic_social",
  "direct_message",
  "community",
  "launch_platform",
  "referral",
  "outreach_email",
  "qr",
  "embed",
  "share",
  "web",
] as const;

export const ACQUISITION_CAMPAIGNS = [
  "android_launch_2026_07",
  "istanbul_pilot_2026_07",
  "istanbul_price_sprint_2026_07",
  "campus_price_tasks_2026_07",
  "publisher_widget",
  "organic_product_share",
  "product_invite",
  "missing_price",
  "first_pin",
  "missing_price_tasks",
  "price_tasks",
  "single_price_task",
] as const;

export const ACQUISITION_CONTENTS = [
  "bio",
  "launch_post",
  "feed_challenge",
  "story_link",
  "champion_invite",
  "founder_circle",
  "founder_post",
  "founder_method_note",
  "feedback_post",
  "launch_page",
  "press_pitch",
  "intro",
  "campus_sprint",
  "campus_editorial",
  "price_walk",
  "district_challenge",
  "partner_followup",
  "qr_card",
  "beyoglu_task",
  "kadikoy_task",
  "besiktas_task",
  "readme_sprint",
  "directory_launch",
  "field_pilot",
  "beyoglu_success",
  "kadikoy_success",
] as const;

export type AcquisitionSurface = (typeof ACQUISITION_SURFACES)[number];
export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];
export type AcquisitionMedium = (typeof ACQUISITION_MEDIUMS)[number];
export type AcquisitionCampaign = (typeof ACQUISITION_CAMPAIGNS)[number];
export type AcquisitionContent = (typeof ACQUISITION_CONTENTS)[number];

export type AcquisitionContext = {
  source: AcquisitionSource;
  medium: AcquisitionMedium;
  campaign: AcquisitionCampaign;
  content?: AcquisitionContent;
};

function included<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function isAcquisitionSurface(value: unknown): value is AcquisitionSurface {
  return included(ACQUISITION_SURFACES, value);
}

export function isAcquisitionSource(value: unknown): value is AcquisitionSource {
  return included(ACQUISITION_SOURCES, value);
}

export function isAcquisitionMedium(value: unknown): value is AcquisitionMedium {
  return included(ACQUISITION_MEDIUMS, value);
}

export function isAcquisitionCampaign(value: unknown): value is AcquisitionCampaign {
  return included(ACQUISITION_CAMPAIGNS, value);
}

export function isAcquisitionContent(value: unknown): value is AcquisitionContent {
  return included(ACQUISITION_CONTENTS, value);
}

export function acquisitionContextFromValues(
  source: unknown,
  medium: unknown,
  campaign: unknown,
  content?: unknown
): AcquisitionContext | null {
  if (
    !isAcquisitionSource(source) ||
    !isAcquisitionMedium(medium) ||
    !isAcquisitionCampaign(campaign)
  ) {
    return null;
  }
  if (content != null && content !== "" && !isAcquisitionContent(content)) return null;
  return {
    source,
    medium,
    campaign,
    ...(isAcquisitionContent(content) ? { content } : {}),
  };
}

export function acquisitionContextFromSearch(search: string): AcquisitionContext | null {
  const params = new URLSearchParams(search);
  return acquisitionContextFromValues(
    params.get("utm_source"),
    params.get("utm_medium"),
    params.get("utm_campaign"),
    params.get("utm_content")
  );
}

export function acquisitionSurfaceForPath(pathname: string): AcquisitionSurface | null {
  if (pathname === "/") return "home";
  if (pathname === "/android") return "android";
  if (pathname === "/en") return "en";
  if (pathname === "/sprint/istanbul") return "sprint_istanbul";
  if (pathname === "/kampus") return "campus";
  if (pathname === "/gorevler") return "task_board";
  if (pathname.startsWith("/gorev/")) return "shared_task";
  if (pathname.startsWith("/pin/")) return "pin_detail";
  if (pathname === "/metodoloji") return "methodology";
  return null;
}
