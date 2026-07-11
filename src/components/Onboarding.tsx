"use client";

import { useEffect, useState } from "react";

const KEY = "pinle_onboarded_v1";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [installEvt, setInstallEvt] = useState<BIPEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
    const onBip = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  const install = async () => {
    if (!installEvt) return;
    await installEvt.prompt();
    await installEvt.userChoice.catch(() => {});
    setInstallEvt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
      <div className="sticker w-full max-w-sm p-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h2 className="display text-2xl font-extrabold text-tomato">Kazık yeme, Pinle.</h2>
        </div>
        <p className="mt-1 text-sm opacity-70">
          Olduğun yerin gerçek fiyat haritası — nereye gidersen git, fiyatı bilerek git.
          Haritayı da sen dolduruyorsun.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔎</span>
            <p className="text-sm">
              <b>Keşfet:</b> Yeme-içmeden markete, eczaneden kuaföre — çevrendeki yerleri gör, fiyatları
              gör.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📌</span>
            <p className="text-sm">
              <b>Pinle:</b> Bildiğin uygun bir yeri 10 saniyede ekle, fiyatını yaz — <b>+10 puan</b>.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">👑</span>
            <p className="text-sm">
              <b>Yarış:</b> Doğrula, puan topla, mahallenin ve şehrinin muhtarı ol.
            </p>
          </div>
        </div>

        <button onClick={dismiss} className="btn btn-tomato mt-5 w-full py-3 text-lg">
          Haritaya Başla 🗺️
        </button>
        {installEvt && (
          <button onClick={install} className="btn btn-cream mt-2 w-full py-2.5 text-sm">
            📲 Ana ekrana ekle
          </button>
        )}
      </div>
    </div>
  );
}
