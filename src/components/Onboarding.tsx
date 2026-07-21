"use client";

import { useState } from "react";

const KEY = "pinle_onboarded_v1";

// Not: burada kurulum butonu YOK. (1) Tarayıcıdan kurulum mağaza dışına
// yönlendirme demek — kurulumu Play'e topluyoruz. (2) Kullanıcı daha haritayı
// görmeden kurulum istemek erken; Play daveti InstallPrompt'ta 12 sn sonra.
export default function Onboarding({ skip = false }: { skip?: boolean }) {
  const [show, setShow] = useState(
    () => !skip && typeof window !== "undefined" && !localStorage.getItem(KEY)
  );

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
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
      </div>
    </div>
  );
}
