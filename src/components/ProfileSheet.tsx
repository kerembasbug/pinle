"use client";

import Link from "next/link";
import { useState } from "react";
import { AVATARS } from "@/lib/avatars";
import type { Me } from "@/lib/types";

type Props = {
  open: boolean;
  me: Me | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
  onChanged: () => void;
};

export default function ProfileSheet({ open, me, onClose, onOpenAuth, onLogout, onToast, onChanged }: Props) {
  const [picking, setPicking] = useState(false);

  const pickAvatar = async (a: string) => {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: a }),
    });
    if (res.ok) {
      setPicking(false);
      onToast(`Avatarın ${a} oldu!`);
      onChanged();
    }
  };
  // Davet linki paylaş: Web Share varsa native sheet, yoksa panoya kopyala.
  const invite = async () => {
    if (!me) return;
    const url = `${location.origin}/?ref=${me.refCode}`;
    const text = "Mahallendeki ucuz lezzetleri ve indirimleri haritada gör — Pinle'ye davetlisin 📍";
    if (navigator.share) {
      await navigator.share({ title: "Pinle", text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      onToast("Davet linki kopyalandı 🔗");
    }
  };
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-ink/20" onClick={onClose} />}
      <div className={`sheet ${open ? "open" : ""}`}>
        <div className="sheet-grip" />
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          {me && (
            <>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setPicking((v) => !v)}
                  className="sticker-flat relative flex h-14 w-14 items-center justify-center bg-mustard text-3xl"
                  aria-label="Avatar seç"
                >
                  {me.avatar ?? (me.isMuhtar ? "👑" : "🐾")}
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-ink bg-cream text-[10px]">
                    ✏️
                  </span>
                </button>
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

              {/* Avatar seçici — sabit emoji listesi */}
              {picking && (
                <div className="sticker-flat mt-3 bg-cream p-2.5">
                  <p className="mb-1.5 text-xs font-bold opacity-60">Avatarını seç 👇</p>
                  <div className="grid grid-cols-8 gap-1">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        onClick={() => pickAvatar(a)}
                        className={`grid h-9 w-9 place-items-center rounded-xl text-xl ${
                          me.avatar === a ? "border-2 border-tomato bg-paper" : "active:bg-paper"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              {/* 🎁 Davet çarkı — davetlin ilk pinini atınca +15 puan */}
              <button onClick={invite} className="btn btn-tomato mt-4 w-full py-3">
                🎁 Arkadaşını davet et {me.invitedCount > 0 ? `(${me.invitedCount} kişi geldi)` : "(+15 puan)"}
              </button>
              <p className="mt-1 text-center text-[11px] opacity-50">
                Davet ettiğin kişi ilk pinini atınca +15 puan kazanırsın
              </p>

              <Link href="/liderler" className="btn btn-mustard mt-3 block py-3 text-center">
                🏆 Liderlik Tablosu
              </Link>

              {/* Giriş / hesap durumu */}
              {me.email ? (
                <div className="mt-3 sticker-flat flex items-center gap-2 bg-[#e7f5f1] px-3 py-2.5">
                  <span className="text-lg">✅</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs opacity-60">Giriş yapıldı</p>
                    <p className="truncate text-sm font-bold">{me.email}</p>
                  </div>
                  <button onClick={onLogout} className="text-xs underline opacity-60">
                    Çıkış
                  </button>
                </div>
              ) : (
                <button onClick={onOpenAuth} className="btn btn-teal mt-3 w-full py-3">
                  🔐 Hesabımı koru / Giriş yap
                </button>
              )}

              <p className="mt-3 text-center text-[11px] opacity-40">
                {me.email
                  ? "Puanların hesabına bağlı — başka cihazda giriş yapınca gelir."
                  : "Anonim hesap — giriş yapmazsan puanların bu cihaza bağlı."}{" "}
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
