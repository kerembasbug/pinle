"use client";

import { useEffect, useRef, useState } from "react";
import type { Me } from "@/lib/types";
import type { ReviewAction } from "@/lib/marketing";
import { isAndroid, isInstalledApp, playReviewUrl } from "@/lib/store";

const SOURCE = "post_contribution" as const;
const MIN_CONTRIBUTIONS = 3;
const COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
const LAST_SHOWN_KEY = "pinle-review-prompt-last-shown";

function track(action: ReviewAction) {
  const payload = JSON.stringify({ source: SOURCE, action });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/events/review",
      new Blob([payload], { type: "application/json" })
    );
    return;
  }
  fetch("/api/events/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export default function ReviewPrompt({ trigger }: { trigger: number }) {
  const [show, setShow] = useState(false);
  const qaMode = useRef(false);

  useEffect(() => {
    // Yerel görsel QA kancası; production derlemesinde etkinleşmez ve olay yazmaz.
    if (
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("review_qa") === "1"
    ) {
      qaMode.current = true;
      const qaTimer = window.setTimeout(() => setShow(true), 0);
      return () => window.clearTimeout(qaTimer);
    }
    if (trigger < 1 || !isAndroid() || !isInstalledApp()) return;

    const lastShown = Number(localStorage.getItem(LAST_SHOWN_KEY) ?? 0);
    if (Date.now() - lastShown < COOLDOWN_MS) return;

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (!response.ok) return;
        const me = (await response.json()) as Me;
        if (me.meaningfulContributionCount < MIN_CONTRIBUTIONS) return;

        // Gösterim anında cooldown başlar; sayfa yenileme istemi tekrarlatmaz.
        localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
        setShow(true);
        track("shown");
      } catch {
        // Ölçüm/bağlantı sorunu katkı akışını asla kesmez.
      }
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [trigger]);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    if (!qaMode.current) track("dismissed");
  };

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-[65] p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
      aria-label="Google Play değerlendirme daveti"
    >
      <div className="sticker mx-auto flex w-full max-w-sm flex-col gap-3 bg-cream p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>💬</span>
          <div className="min-w-0">
            <h2 className="font-extrabold">Deneyimini Google Play&apos;de paylaş</h2>
            <p className="mt-1 text-sm leading-snug opacity-70">
              Pinle&apos;yi birkaç kez kullandın. Dürüst değerlendirmen, uygulamayı
              geliştirmemize yardımcı olur.
            </p>
          </div>
        </div>
        <a
          href={playReviewUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-tomato min-h-11 px-4 py-2.5 text-center text-sm"
          onClick={() => {
            setShow(false);
            if (!qaMode.current) track("open_play");
          }}
        >
          Dürüst değerlendirme bırak
        </a>
        <button onClick={dismiss} className="min-h-11 text-sm underline opacity-60">
          Şimdi değil
        </button>
      </div>
    </aside>
  );
}
