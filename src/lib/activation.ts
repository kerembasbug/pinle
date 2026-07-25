import {
  isActivationSource,
  type ActivationAction,
  type ActivationSource,
} from "./marketing";
import {
  acquisitionContextFromSearch,
  type AcquisitionContext,
} from "./acquisition";

const STARTED_PREFIX = "pinle-contribution-mission-started:";
const ENGAGED_PREFIX = "pinle-contribution-mission-engaged:";
const PENDING_KEY = "pinle-contribution-mission-pending";

export type CompletedMission = {
  source: ActivationSource;
  acquisition?: AcquisitionContext;
};

function track(
  source: ActivationSource,
  action: ActivationAction,
  acquisition?: AcquisitionContext
) {
  const payload = JSON.stringify({
    source,
    action,
    ...(acquisition
      ? {
          acquisition_source: acquisition.source,
          acquisition_medium: acquisition.medium,
          acquisition_campaign: acquisition.campaign,
          acquisition_content: acquisition.content,
        }
      : {}),
  });
  if (navigator.sendBeacon) {
    const accepted = navigator.sendBeacon(
      "/api/events/activation",
      new Blob([payload], { type: "application/json" })
    );
    if (accepted) return;
  }
  fetch("/api/events/activation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

/** Kaynak bazında görev başlangıcını aynı tarayıcı oturumunda tekilleştir. */
export function startContributionMission(
  source: ActivationSource,
  action: "open_missing_price" | "start_new_pin"
) {
  try {
    if (sessionStorage.getItem(PENDING_KEY)) return;
    const startedKey = `${STARTED_PREFIX}${source}`;
    if (sessionStorage.getItem(startedKey)) return;
    sessionStorage.setItem(startedKey, "1");
    const acquisition = acquisitionContextFromSearch(window.location.search) ?? undefined;
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ source, acquisition } satisfies CompletedMission));
    track(source, action, acquisition);
  } catch {
    // Depolama kapalıysa görev yine çalışır; yalnız attribution atlanır.
  }
}

function pendingContributionMission(): CompletedMission | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (isActivationSource(raw)) return { source: raw };
  if (!raw) return null;

  const parsed = JSON.parse(raw) as Partial<CompletedMission>;
  if (!isActivationSource(parsed.source)) return null;
  return {
    source: parsed.source,
    acquisition: parsed.acquisition,
  };
}

/** Görevden gelen kullanıcının fiyat formundaki ilk etkileşimini oturumda tekilleştir. */
export function engageContributionMission() {
  try {
    const pending = pendingContributionMission();
    if (!pending) return;
    const engagedKey = `${ENGAGED_PREFIX}${pending.source}`;
    if (sessionStorage.getItem(engagedKey)) return;
    sessionStorage.setItem(engagedKey, "1");
    track(pending.source, "form_engaged", pending.acquisition);
  } catch {
    // Katkı akışı ölçüm sorunundan etkilenmez.
  }
}

/** Görev açıldıktan sonraki ilk anlamlı katkıyı anonim funnel tamamlanması say. */
export function completeContributionMission(): CompletedMission | null {
  try {
    const pending = pendingContributionMission();
    if (!pending) {
      sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    sessionStorage.removeItem(PENDING_KEY);
    track(pending.source, "completed", pending.acquisition);
    return pending;
  } catch {
    // Katkı akışı ölçüm sorunundan etkilenmez.
    return null;
  }
}
