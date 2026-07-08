"use client";

import Link from "next/link";
import type { Me } from "@/lib/types";

type Props = { open: boolean; me: Me | null; onClose: () => void };

export default function ProfileSheet({ open, me, onClose }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-ink/20" onClick={onClose} />}
      <div className={`sheet ${open ? "open" : ""}`}>
        <div className="sheet-grip" />
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          {me && (
            <>
              <div className="flex items-center gap-3 pt-2">
                <div className="sticker-flat flex h-14 w-14 items-center justify-center bg-mustard text-3xl">
                  {me.isMuhtar ? "👑" : "🐾"}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold leading-tight">{me.name}</h2>
                  <p className="text-sm opacity-70">
                    ⭐ {me.points} puan · 📌 {me.pinCount} pin
                  </p>
                  {me.isMuhtar ? (
                    <p className="text-xs font-bold text-tomato">👑 Haftanın Muhtarı sensin!</p>
                  ) : (
                    me.weeklyRank != null && (
                      <p className="text-xs opacity-60">
                        Bu hafta {me.weeklyRank}. sıradasın ({me.weeklyPoints} puan)
                      </p>
                    )
                  )}
                </div>
              </div>

              <h3 className="mt-4 text-sm font-bold opacity-70">Rozetler</h3>
              <div className="mt-2 flex flex-col gap-2">
                {me.badges.map((b) => (
                  <div
                    key={b.id}
                    className={`sticker-flat flex items-center gap-3 px-3 py-2.5 ${
                      b.earned ? "bg-[#e7f5f1]" : "opacity-60"
                    }`}
                  >
                    <span className="text-2xl">{b.earned ? b.emoji : "🔒"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{b.label}</p>
                      <p className="text-xs opacity-60">{b.progress}</p>
                    </div>
                    {b.earned && <span className="text-teal font-bold text-sm">Kazanıldı ✓</span>}
                  </div>
                ))}
              </div>

              <Link href="/liderler" className="btn btn-mustard mt-4 block py-3 text-center">
                🏆 Liderlik Tablosu
              </Link>
              <p className="mt-3 text-center text-[11px] opacity-40">
                Anonim hesap — puanların bu cihazın çerezine bağlı ·{" "}
                <Link href="/gizlilik" className="underline">
                  Gizlilik
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
