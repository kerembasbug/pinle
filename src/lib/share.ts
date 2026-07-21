import type { ShareSource } from "./marketing";

/**
 * Anonim paylaşım tamamlanma/niyet sinyali. Kimlik, URL, metin, hedef kişi veya
 * IP saklanmaz; yalnız allowlist kaynak ve sunucu zaman damgası tutulur.
 */
export function trackShare(source: ShareSource) {
  const payload = JSON.stringify({ source });
  if (navigator.sendBeacon) {
    const accepted = navigator.sendBeacon(
      "/api/events/share",
      new Blob([payload], { type: "application/json" }),
    );
    if (accepted) return;
  }
  fetch("/api/events/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
