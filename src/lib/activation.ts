import {
  isActivationSource,
  type ActivationAction,
  type ActivationSource,
} from "./marketing";

const STARTED_PREFIX = "pinle-contribution-mission-started:";
const PENDING_KEY = "pinle-contribution-mission-pending";

function track(source: ActivationSource, action: ActivationAction) {
  const payload = JSON.stringify({ source, action });
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
    sessionStorage.setItem(PENDING_KEY, source);
    track(source, action);
  } catch {
    // Depolama kapalıysa görev yine çalışır; yalnız attribution atlanır.
  }
}

/** Görev açıldıktan sonraki ilk anlamlı katkıyı anonim funnel tamamlanması say. */
export function completeContributionMission() {
  try {
    const source = sessionStorage.getItem(PENDING_KEY);
    if (!isActivationSource(source)) {
      sessionStorage.removeItem(PENDING_KEY);
      return;
    }
    sessionStorage.removeItem(PENDING_KEY);
    track(source, "completed");
  } catch {
    // Katkı akışı ölçüm sorunundan etkilenmez.
  }
}
