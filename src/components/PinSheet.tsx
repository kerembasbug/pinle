"use client";

import { useEffect, useRef, useState } from "react";
import { categoryById, kindMeta } from "@/lib/categories";
import type { Comment, PinDetail } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/types";
import { blockAuthor, getBlocked } from "@/lib/blocklist";

type Props = {
  pinId: string | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  onChanged: () => void;
};

export default function PinSheet({ pinId, onClose, onToast, onChanged }: Props) {
  const [pin, setPin] = useState<PinDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myVote, setMyVote] = useState(0);
  const [text, setText] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [editingPrice, setEditingPrice] = useState(false);
  const [busy, setBusy] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!pinId) return;
    loadedFor.current = pinId;
    setPin(null);
    setPriceInput("");
    setEditingPrice(false);
    fetch(`/api/pins/${pinId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (loadedFor.current !== pinId) return;
        setPin(data.pin);
        setComments(data.comments);
        setMyVote(data.myVote);
      })
      .catch(() => {
        onToast("Pin yüklenemedi");
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinId]);

  const vote = async (value: 1 | -1) => {
    if (!pin || busy) return;
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Olmadı");
    setPin({ ...pin, confirms: data.confirms, outdated: data.outdated });
    setMyVote(data.myVote);
    if (data.earned > 0) onToast(`+${data.earned} puan! 🗳️`);
    onChanged();
  };

  const sendComment = async () => {
    if (!pin || !text.trim() || busy) return;
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text.trim() }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Yorum gönderilemedi");
    setComments((c) => [...c, data.comment]);
    setText("");
    onToast(`+${data.earned} puan! 💬`);
  };

  const submitPrice = async () => {
    if (!pin || busy) return;
    const val = Number(priceInput.replace(",", ".").replace(/[^\d.]/g, ""));
    if (!Number.isFinite(val) || val < 1 || val > 100000) {
      return onToast("Geçerli bir fiyat gir (₺)");
    }
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}/price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: val }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Fiyat kaydedilemedi");
    setPin({ ...pin, price: data.price, confirms: data.confirms, outdated: data.outdated });
    if (data.myVote !== undefined) setMyVote(data.myVote);
    setPriceInput("");
    setEditingPrice(false);
    onToast(`+${data.earned} puan · fiyat kaydedildi 🏷️`);
    onChanged();
  };

  const share = async () => {
    if (!pin) return;
    const url = `${location.origin}/pin/${pin.id}`;
    const title = `${pin.name} — Pinle`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      onToast("Link kopyalandı 🔗");
    }
  };

  const report = async () => {
    if (!pin || !confirm("Bu pini uygunsuz/yanlış olarak bildirmek istiyor musun?")) return;
    const res = await fetch(`/api/pins/${pin.id}/report`, { method: "POST" });
    if (res.ok) {
      onToast("Bildirildi, teşekkürler 🙏");
      onClose();
      onChanged();
    }
  };

  const block = () => {
    if (!pin) return;
    if (!confirm(`${pin.author} adlı kullanıcının tüm içeriklerini bu cihazda gizle?`)) return;
    blockAuthor(pin.authorId);
    onToast("Kullanıcı gizlendi 🙈");
    onClose();
    onChanged();
  };

  const cat = pin ? categoryById(pin.category) : null;
  const meta = pin ? kindMeta(pin.kind) : null;
  const price = pin ? formatPrice(pin.price) : null;
  const isFood = pin?.kind === "lezzet";
  const needsPrice = isFood && pin?.price == null; // fiyatsız yemek pini → oylama anlamsız
  const blocked = getBlocked();
  const visibleComments = comments.filter((c) => !blocked.has(c.authorId));

  const priceEditor = (
    <div className="flex gap-2">
      <div className="sticker-flat flex flex-1 items-center gap-1 bg-cream px-3">
        <span className="text-lg font-bold text-tomato">₺</span>
        <input
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitPrice()}
          inputMode="decimal"
          maxLength={8}
          placeholder="örn. 120"
          className="w-full bg-transparent py-2.5 text-sm outline-none"
          autoFocus
        />
      </div>
      <button
        onClick={submitPrice}
        disabled={busy || !priceInput.trim()}
        className="btn btn-tomato px-4 text-sm"
      >
        Kaydet
      </button>
    </div>
  );

  return (
    <>
      {pinId && <div className="fixed inset-0 z-20" onClick={onClose} />}
      <div className={`sheet ${pinId ? "open" : ""}`}>
        <div className="sheet-grip" />
        {!pin ? (
          <div className="p-8 text-center text-sm opacity-60">Yükleniyor…</div>
        ) : (
          <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
            <div className="flex items-start gap-3 pt-2">
              <div className="sticker-flat flex h-12 w-12 shrink-0 items-center justify-center text-2xl bg-paper">
                {cat!.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold leading-tight">{pin.name}</h2>
                <p className="text-xs opacity-60">
                  {cat!.label} · {pin.author} · {timeAgo(pin.created_at)}
                </p>
              </div>
              {price && (
                <div className="display text-2xl font-extrabold text-tomato">{price}</div>
              )}
            </div>

            {pin.note && <p className="mt-3 text-[15px] leading-snug">{pin.note}</p>}
            {pin.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/uploads/${pin.photo}`}
                alt={pin.name}
                className="sticker-flat mt-3 max-h-56 w-full object-cover"
              />
            )}

            {needsPrice ? (
              /* Fiyatsız yemek pini — çekirdek eksik veri. Ekleme akışı öne çıkar,
                 oylama gizli (doğrulanacak fiyat yok). Yeniden pinlemeye gerek yok. */
              <div className="mt-4 sticker-flat bg-cream p-3">
                <p className="text-sm font-extrabold">💰 Fiyatı biliyor musun?</p>
                <p className="mb-2 text-xs opacity-60">
                  Ekle, mahalle görsün. <span className="font-bold text-tomato">+5 puan</span> —
                  çıkıp yeniden pinlemene gerek yok.
                </p>
                {priceEditor}
              </div>
            ) : (
              <>
                {/* Doğrulama */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => vote(1)}
                    disabled={pin.isMine}
                    className={`btn flex-1 py-2.5 text-sm ${myVote === 1 ? "btn-teal" : "btn-cream"}`}
                  >
                    {meta!.voteYes} ({pin.confirms})
                  </button>
                  {meta!.voteNo && (
                    <button
                      onClick={() => vote(-1)}
                      disabled={pin.isMine}
                      className={`btn flex-1 py-2.5 text-sm ${myVote === -1 ? "btn-tomato" : "btn-cream"}`}
                    >
                      {meta!.voteNo} ({pin.outdated})
                    </button>
                  )}
                </div>
                {pin.isMine && (
                  <p className="mt-1.5 text-center text-xs opacity-50">Kendi pinini oylayamazsın</p>
                )}
                {/* Fiyatlı yemek pini — güncel fiyatı bildir */}
                {isFood &&
                  (editingPrice ? (
                    <div className="mt-2">{priceEditor}</div>
                  ) : (
                    <button
                      onClick={() => setEditingPrice(true)}
                      className="mt-2 text-xs underline opacity-50"
                    >
                      💸 Fiyat değişti mi? Güncelle
                    </button>
                  ))}
              </>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button onClick={share} className="btn btn-mustard flex-1 py-2 text-sm">
                Paylaş 📤
              </button>
              <button onClick={report} className="text-xs underline opacity-50 px-2">
                Bildir
              </button>
              {!pin.isMine && (
                <button onClick={block} className="text-xs underline opacity-50 px-2">
                  Kullanıcıyı gizle
                </button>
              )}
            </div>

            {/* Yorumlar */}
            <h3 className="mt-5 text-sm font-bold opacity-70">Yorumlar ({visibleComments.length})</h3>
            <div className="mt-2 flex flex-col gap-2">
              {visibleComments.length === 0 && (
                <p className="text-sm opacity-50">İlk yorumu sen yaz 👇</p>
              )}
              {visibleComments.map((c) => (
                <div key={c.id} className="sticker-flat px-3 py-2">
                  <p className="text-[10px] font-bold text-teal">
                    {c.author} <span className="font-normal opacity-50">· {timeAgo(c.created_at)}</span>
                  </p>
                  <p className="text-sm">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendComment()}
                maxLength={280}
                placeholder="Yorum yaz… (+3 puan)"
                className="sticker-flat flex-1 px-3 py-2 text-sm outline-none focus:border-tomato bg-cream"
              />
              <button onClick={sendComment} disabled={busy || !text.trim()} className="btn btn-teal px-4 text-sm">
                Gönder
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
