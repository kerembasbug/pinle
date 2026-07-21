import type { ActivationAction } from "./marketing";

const SOURCE = "first_contribution_mission" as const;
const STARTED_KEY = "pinle-first-contribution-mission-started";
const PENDING_KEY = "pinle-first-contribution-mission-pending";

function track(action: ActivationAction) {
  const payload = JSON.stringify({ source: SOURCE, action });
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

/** Aynı tarayıcı oturumunda ilk görev açılışını tekilleştir. */
export function startFirstContributionMission(
  action: "open_missing_price" | "start_new_pin"
) {
  try {
    if (sessionStorage.getItem(STARTED_KEY)) return;
    sessionStorage.setItem(STARTED_KEY, "1");
    sessionStorage.setItem(PENDING_KEY, "1");
    track(action);
  } catch {
    // Depolama kapalıysa görev yine çalışır; yalnız attribution atlanır.
  }
}

/** Görev açıldıktan sonraki ilk anlamlı katkıyı anonim funnel tamamlanması say. */
export function completeFirstContributionMission() {
  try {
    if (!sessionStorage.getItem(PENDING_KEY)) return;
    sessionStorage.removeItem(PENDING_KEY);
    track("completed");
  } catch {
    // Katkı akışı ölçüm sorunundan etkilenmez.
  }
}
