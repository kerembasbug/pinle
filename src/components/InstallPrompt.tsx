"use client";

import { useEffect, useState } from "react";
import { playUrl, isAndroid, isInstalledApp } from "@/lib/store";

// "Uygulama gibi kullan" daveti.
// Android: ARTIK Play Store birincil yol (mağaza kurulumu güncelleme + yorum
//   getirir). beforeinstallprompt yakalanırsa tarayıcıdan kurulum ikincil
//   seçenek olarak durur — mağazaya gitmek istemeyen kullanıcıyı kaybetmeyelim.
// iOS: Play yok, beforeinstallprompt da yok → Paylaş → Ana Ekrana Ekle yönergesi.
// Zaten uygulamadaysa (TWA ya da eklenmiş PWA) hiç görünmez; kapatılırsa 7 gün susar.
type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pinle-a2hs-dismiss";
const DELAY_MS = 12000;

export default function InstallPrompt({ onToast }: { onToast: (msg: string) => void }) {
  const [bip, setBip] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInstalledApp()) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setBip(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    // Android'de Play linki her zaman geçerli — beforeinstallprompt'u bekleme
    // (Chrome dışı tarayıcılarda ya da kriterler tutmazsa o olay hiç gelmez).
    let t: ReturnType<typeof setTimeout> | null = null;
    if (isAndroid()) {
      setAndroid(true);
      t = setTimeout(() => setShow(true), DELAY_MS);
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      t = setTimeout(() => {
        setIos(true);
        setShow(true);
      }, DELAY_MS);
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
      <div className="sticker flex max-w-[250px] flex-col gap-2 p-3">
        {android ? (
          <>
            <p className="text-[13px] font-bold leading-snug">
              📲 Pinle&apos;yi telefonuna kur — Google Play&apos;de yayında.
            </p>
            <a
              href={playUrl("install-banner")}
              target="_blank"
              rel="noopener"
              onClick={dismiss}
              className="btn btn-tomato py-2 text-center text-sm"
            >
              Google Play&apos;den indir
            </a>
            {bip && (
              <button onClick={install} className="text-[11px] underline opacity-60">
                ya da tarayıcıdan yükle
              </button>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
        <button onClick={dismiss} className="text-[11px] underline opacity-50">
          Şimdi değil
        </button>
      </div>
    </div>
  );
}
