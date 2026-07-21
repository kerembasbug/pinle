"use client";

import { useEffect, useState } from "react";
import { isAndroid, isInstalledApp } from "@/lib/store";
import PlayStoreLink from "./PlayStoreLink";

// Kurulum daveti — TEK YOL Google Play.
// Tarayıcıdan kurulum (PWA/A2HS) BİLEREK kaldırıldı: mağaza dışına yönlendirmek
// kendi Play listelemenle rekabet ediyor (kurulum sayısı, yorum ve sıralama
// oradan geliyor). Manifest'te de prefer_related_applications=true.
//
// iOS istisnası: iOS uygulaması YOK, Play linki iPhone'da işe yaramaz. Oradaki
// tek seçenek ana ekrana ekleme — bu mağaza dışına yönlendirme değil, çünkü
// yönlendirilecek bir mağaza sürümü yok.
// Zaten uygulamadaysa hiç görünmez; kapatılırsa 7 gün susar.
const DISMISS_KEY = "pinle-a2hs-dismiss";
const DELAY_MS = 12000;

export default function InstallPrompt({ onToast }: { onToast: (msg: string) => void }) {
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInstalledApp()) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;

    // Chrome'un kendi "uygulamayı yükle" balonunu bastır — kullanıcıyı Play'e
    // gönderiyoruz, iki ayrı kurulum yolu göstermek kafa karıştırıyor.
    const blockBip = (e: Event) => e.preventDefault();
    window.addEventListener("beforeinstallprompt", blockBip);

    let t: ReturnType<typeof setTimeout> | null = null;
    if (isAndroid()) {
      t = setTimeout(() => {
        setPlatform("android");
        setShow(true);
      }, DELAY_MS);
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      t = setTimeout(() => {
        setPlatform("ios");
        setShow(true);
      }, DELAY_MS);
    }
    // Masaüstü: hiçbir şey gösterme — indirilecek masaüstü sürümü yok.

    const onInstalled = () => {
      setShow(false);
      onToast("Pinle ana ekranına eklendi 🎉");
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", blockBip);
      window.removeEventListener("appinstalled", onInstalled);
      if (t) clearTimeout(t);
    };
  }, [onToast]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 z-20 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
      <div className="sticker flex max-w-[250px] flex-col gap-2 p-3">
        {platform === "android" ? (
          <>
            <p className="text-[13px] font-bold leading-snug">
              📲 Pinle&apos;yi telefonuna kur — Google Play&apos;de yayında.
            </p>
            <PlayStoreLink
              source="install_banner"
              onClick={dismiss}
              className="btn btn-tomato py-2 text-center text-sm"
            >
              Google Play&apos;den indir
            </PlayStoreLink>
          </>
        ) : (
          platform === "ios" && (
            <>
              <p className="text-[13px] font-bold leading-snug">
                📲 Pinle&apos;yi ana ekranına ekle — tek dokunuşla açılsın.
              </p>
              <p className="text-[12px] opacity-70">
                Safari&apos;de <b>Paylaş</b> <span aria-hidden>⎋</span> →{" "}
                <b>Ana Ekrana Ekle</b> de, bu kadar.
              </p>
            </>
          )
        )}
        <button onClick={dismiss} className="text-[11px] underline opacity-50">
          Şimdi değil
        </button>
      </div>
    </div>
  );
}
