"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

type Props = {
  open: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
  onLinked: () => void; // giriş başarılı → me'yi tazele
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function AuthSheet({ open, onClose, onToast, onLinked }: Props) {
  const googleDiv = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  // Google Identity Services
  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID) return;
    const handle = (resp: { credential: string }) => {
      fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: resp.credential }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            onToast("Giriş başarılı 🎉");
            onLinked();
            onClose();
          } else onToast(d.error ?? "Google girişi başarısız");
        })
        .catch(() => onToast("Google girişi başarısız"));
    };
    const init = () => {
      if (!window.google || !googleDiv.current) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handle });
      window.google.accounts.id.renderButton(googleDiv.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        locale: "tr",
        width: 280,
      });
    };
    if (window.google) init();
    else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    }
  }, [open, onToast, onLinked, onClose]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setSent(false);
    }
  }, [open]);

  const sendLink = async () => {
    if (busy) return;
    setBusy(true);
    const res = await fetch("/api/auth/email/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(d.error ?? "Gönderilemedi");
    setSent(true);
    if (d.devLink) console.log("[dev] magic link:", d.devLink);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-ink/30" onClick={onClose} />}
      <div className={`sheet z-50 ${open ? "open" : ""}`}>
        <div className="sheet-grip" />
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <h2 className="pt-1 text-xl font-extrabold">Hesabını koru</h2>
          <p className="text-xs opacity-60">
            Anonim kullanmaya devam edebilirsin. Giriş yaparsan puanların ve pinlerin başka cihazda
            da seninle gelir.
          </p>

          {GOOGLE_CLIENT_ID && (
            <div className="mt-4 flex justify-center">
              <div ref={googleDiv} />
            </div>
          )}

          <div className="my-4 flex items-center gap-2 opacity-40">
            <div className="h-px flex-1 bg-ink" />
            <span className="text-xs">ya da e-posta ile</span>
            <div className="h-px flex-1 bg-ink" />
          </div>

          {sent ? (
            <div className="sticker-flat bg-cream px-3 py-3 text-sm">
              📬 <b>{email}</b> adresine giriş bağlantısı gönderdik. Gelen kutunu kontrol et (20 dk
              geçerli).
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                placeholder="e-posta adresin"
                className="sticker-flat flex-1 bg-cream px-3 py-2.5 text-[15px] outline-none focus:border-tomato"
              />
              <button
                onClick={sendLink}
                disabled={busy || !email.includes("@")}
                className="btn btn-tomato px-4 text-sm"
              >
                {busy ? "…" : "Gönder"}
              </button>
            </div>
          )}

          <button onClick={onClose} className="btn btn-cream mt-4 w-full py-2.5 text-sm">
            Şimdilik anonim devam et
          </button>
        </div>
      </div>
    </>
  );
}
