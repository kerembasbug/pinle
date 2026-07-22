"use client";

import { useEffect } from "react";
import { trackShare } from "@/lib/share";

type SprintSource = "sprint_beyoglu" | "sprint_kadikoy";

export default function SprintSuccessPrompt({
  source,
  onClose,
  onToast,
}: {
  source: SprintSource | null;
  onClose: () => void;
  onToast: (message: string) => void;
}) {
  useEffect(() => {
    if (!source) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, source]);

  if (!source) return null;

  const district = source === "sprint_beyoglu" ? "Beyoğlu" : "Kadıköy";
  const content = source === "sprint_beyoglu" ? "beyoglu_success" : "kadikoy_success";
  const shareSource =
    source === "sprint_beyoglu" ? "sprint_success_beyoglu" : "sprint_success_kadikoy";
  const text = `${district} takımına bir gerçek fiyat sinyali bıraktım. Sıra sende: bildiğin tek bir fiyat görevini tamamla.`;

  const share = async () => {
    const url = new URL("/sprint/istanbul", window.location.origin);
    url.searchParams.set("utm_source", "sprint_contributor");
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set("utm_campaign", "istanbul_price_sprint_2026_07");
    url.searchParams.set("utm_content", content);

    try {
      if (navigator.share) {
        await navigator.share({ title: "Pinle İstanbul Fiyat Sprinti", text, url: url.toString() });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        onToast("Takım daveti kopyalandı 🔗");
      }
      trackShare(shareSource);
      onClose();
    } catch {
      // Native paylaşım iptal edilirse paylaşım niyeti yazma ve modalı açık tut.
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/55 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sprint-success-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sticker-flat w-full max-w-md p-5 sm:p-7">
        <p className="text-sm font-extrabold uppercase tracking-wide text-teal">Gerçek katkı tamamlandı ✓</p>
        <h2 id="sprint-success-title" className="mt-2 text-3xl font-extrabold leading-tight">
          {district} takımına bir fiyat sinyali bıraktın
        </h2>
        <p className="mt-3 text-sm leading-relaxed opacity-75">
          Seed noktaları skora eklenmez. Şimdi bildiğin tek bir fiyatı tamamlaması için bir
          arkadaşını çağır; davet doğrudan ilçe görevlerine gider.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button onClick={share} className="btn btn-tomato min-h-12 flex-1 px-5 py-3">
            Takımını çağır 📤
          </button>
          <button onClick={onClose} className="btn btn-cream min-h-12 px-5 py-3">
            Şimdi değil
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] leading-relaxed opacity-55">
          Paylaşım içeriğini ve hedef kişiyi Pinle kaydetmez.
        </p>
      </div>
    </div>
  );
}
