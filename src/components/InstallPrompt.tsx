"use client";

import { useEffect, useState } from "react";

// Tarayıcıdan "uygulama gibi yükle" daveti (PWA / A2HS).
// Android/Chrome: beforeinstallprompt yakalanır → tek dokunuşla yükleme.
// iOS/Safari: olay yok → kısa yönerge gösterilir (Paylaş → Ana Ekrana Ekle).
// Kapatılırsa 7 gün susar; zaten yüklüyse (standalone) hiç görünmez.
type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pinle-a2hs-dismiss";

export default function InstallPrompt({ onToast }: { onToast: (msg: string) => void }) {
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    // iOS: beforeinstallprompt yok → biraz gezindikten sonra yönerge göster
    let t: ReturnType<typeof setTimeout> | null = null;
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      t = setTimeout(() => {
        setIos(true);
        setShow(true);
      }, 12000);
    }

    const onInstalled = () => {
      setShow(false);
      onToast("Pinle ana ekranına eklendi 🎉");
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      if (t) clearTimeout(t);
    };
  }, [onToast]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const install = async () => {
    if (!bip) return;
    setShow(false);
    await bip.prompt().catch(() => {});
  };

  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 z-20 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
      <div className="sticker flex max-w-[240px] flex-col gap-2 p-3">
        <p className="text-[13px] font-bold leading-snug">
          📲 Pinle&apos;yi uygulama gibi kullan — market beklemeden, 1 saniyede.
        </p>
        {ios ? (
          <p className="text-[12px] opacity-70">
            Safari&apos;de <b>Paylaş</b> <span aria-hidden>⎋</span> →{" "}
            <b>Ana Ekrana Ekle</b> de, bu kadar.
          </p>
        ) : (
          <button onClick={install} className="btn btn-tomato py-2 text-sm">
            Yükle 🚀
          </button>
        )}
        <button onClick={dismiss} className="text-[11px] underline opacity-50">
          Şimdi değil
        </button>
      </div>
    </div>
  );
}
