"use client";

import { useEffect, useRef, useState } from "react";
import { PLACE_TYPES, categoryById, categoryIcon, isPriceable, itemSuggestionsFor, kindMeta, placeTypeIdOf, type PinKind } from "@/lib/categories";
import type { Comment, PinDetail } from "@/lib/types";
import { formatPrice, timeAgo } from "@/lib/types";
import { isStalePrice, validityLabel } from "@/lib/validity";
import { playPinSound } from "@/lib/sfx";
import { trackShare } from "@/lib/share";
import { Avatar } from "./Avatar";
import { blockAuthor, getBlocked } from "@/lib/blocklist";
import { useItemSuggest } from "./useItemSuggest";

type Props = {
  pinId: string | null;
  onClose: () => void;
  onToast: (msg: string) => void;
  onChanged: () => void;
};

// Dopamin patlaması: kart üzerinde yükselen emoji konfetisi (saf CSS animasyon)
function EmojiBurst({ seed }: { seed: number }) {
  if (!seed) return null;
  const emojis = ["🎉", "✨", "🏷️", "💛", "🙌", "⭐"];
  return (
    <div key={seed} className="burst-layer" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="burst-emoji"
          style={{
            left: `${8 + ((i * 83) % 84)}%`,
            animationDelay: `${(i % 5) * 60}ms`,
            fontSize: `${16 + ((i * 7) % 14)}px`,
          }}
        >
          {emojis[i % emojis.length]}
        </span>
      ))}
    </div>
  );
}

export default function PinSheet({ pinId, onClose, onToast, onChanged }: Props) {
  const [pin, setPin] = useState<PinDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myVote, setMyVote] = useState(0);
  const [myThanks, setMyThanks] = useState(false);
  const [text, setText] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [itemInput, setItemInput] = useState("");
  const [qty, setQty] = useState(1);
  const [validInput, setValidInput] = useState(""); // opsiyonel geçerlilik tarihi
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [editingCat, setEditingCat] = useState(false);
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!pinId) return;
    loadedFor.current = pinId;
    setPin(null);
    setPriceInput("");
    setQty(1);
    setValidInput("");
    setEditingPrice(false);
    setEditingName(false);
    setEditingCat(false);
    setBurst(0);
    fetch(`/api/pins/${pinId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (loadedFor.current !== pinId) return;
        setPin(data.pin);
        setComments(data.comments);
        setMyVote(data.myVote);
        setMyThanks(!!data.myThanks);
        // Mevcut kalem varsa ön-doldur; yoksa BOŞ bırak (kategori adı değil —
        // "Esnaf Lokantası" bir ürün değildir; öneri çipleri yol gösterir).
        setItemInput(data.pin.price_item ?? "");
      })
      .catch(() => {
        onToast("Pin yüklenemedi");
        onClose();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinId]);

  const pop = () => setBurst(Date.now());

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
    if (data.earned > 0) {
      onToast(`+${data.earned} puan! 🗳️`);
      pop();
    }
    onChanged();
  };

  const thank = async () => {
    if (!pin || busy || myThanks) return;
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}/thanks`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Olmadı");
    setMyThanks(true);
    setPin({ ...pin, thanks: data.thanks });
    if (data.isNew) {
      onToast("Teşekkürün pinleyene iletildi 🙏");
      pop();
    }
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
    onChanged(); // puan çipi anında güncellensin (dopamin tam anında) + marker yorum sayacı
  };

  // Topluluk isim önerisi — herkes önerir, en çok önerilen ad kazanır.
  const saveName = async () => {
    if (!pin || busy) return;
    const v = nameInput.trim();
    if (v.length < 2) return onToast("İsim en az 2 karakter");
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}/name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: v }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Öneri kaydedilemedi");
    setPin({ ...pin, name: data.name }); // kazanan (kabul gören) ad
    setEditingName(false);
    // Önerin kaydedildi ama başka ad daha çok oy aldıysa bilgilendir
    onToast(data.pending ? "Önerin kaydedildi 🙌 (şu an başka ad önde)" : "Ad güncellendi ✏️");
    onChanged();
  };

  const saveCategory = async (categoryId: string) => {
    if (!pin || busy) return;
    if (placeTypeIdOf(pin.category) === categoryId) {
      setEditingCat(false);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: categoryId }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Tür güncellenemedi");
    setPin({ ...pin, category: data.category });
    setEditingCat(false);
    onToast("Tür güncellendi ✏️");
    onChanged();
  };

  const submitPrice = async () => {
    if (!pin || busy) return;
    const val = Number(priceInput.replace(",", ".").replace(/[^\d.]/g, ""));
    if (!Number.isFinite(val) || val < 1 || val > 100000) {
      return onToast("Geçerli bir fiyat gir (₺)");
    }
    const item = itemInput.trim();
    if (!item) return onToast("Ne aldın? (örn. Balık ekmek)");
    setBusy(true);
    const res = await fetch(`/api/pins/${pin.id}/price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: val, item, qty, validUntil: validInput || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return onToast(data.error ?? "Fiyat kaydedilemedi");
    setPin({
      ...pin,
      price: data.price,
      price_item: data.price_item,
      price_updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      price_valid_until: data.price_valid_until ?? null,
      confirms: data.confirms,
      outdated: data.outdated,
    });
    if (data.myVote !== undefined) setMyVote(data.myVote);
    setPriceInput("");
    setQty(1);
    setValidInput("");
    setEditingPrice(false);
    const unitInfo =
      data.qty > 1 ? `${data.qty} adet ₺${data.total} → tanesi ₺${data.price} · ` : "";
    onToast(`${unitInfo}+${data.earned} puan! ${data.firstPrice ? "İlk fiyatı sen açtın 🔓" : "🏷️"}`);
    playPinSound();
    pop();
    onChanged();
  };

  const share = async () => {
    if (!pin) return;
    const url = new URL(`/pin/${pin.id}`, location.origin);
    url.searchParams.set("utm_source", "pin_share");
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set("utm_campaign", "organic_product_share");
    const title = `${pin.name} — Pinle`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: url.toString() });
      } else {
        await navigator.clipboard.writeText(url.toString());
        onToast("Link kopyalandı 🔗");
      }
      trackShare("pin_share");
    } catch {
      // Kullanıcı native paylaşım penceresini kapattıysa dönüşüm yazma.
    }
  };

  const report = async () => {
    if (!pin || !confirm("Bu mekan kapandı ya da yanlış mı? Bildirdiğinde birkaç kişi daha onaylayınca haritadan kalkar.")) return;
    const res = await fetch(`/api/pins/${pin.id}/report`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      onToast(data.hidden ? "Kapandı olarak işaretlendi, haritadan kalktı 🙏" : "Bildirin alındı, teşekkürler 🙏");
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
  const priceable = pin ? isPriceable(pin.kind as PinKind, pin.category) : false; // yeme-içme
  const canPrice = pin?.kind === "lezzet"; // her mekana fiyat girilebilir (hizmetler dahil)
  const needsPrice = priceable && pin?.price == null; // fiyatsız yemek pini → oylama anlamsız
  // Çipler: topluluğun geçmiş girdileri (yazdıkça daralır) + statik öneriler
  const learned = useItemSuggest(itemInput, pin?.category ?? "", !!pin && (needsPrice || editingPrice));
  const suggestions = pin
    ? Array.from(new Set([...learned, ...itemSuggestionsFor(pin.category)])).slice(0, 8)
    : [];
  const blocked = getBlocked();
  const visibleComments = comments.filter((c) => !blocked.has(c.authorId));

  const priceEditor = (
    <div className="flex flex-col gap-2">
      {/* Öneri çipleri — yazmayı hızlandırır, serbest metin her zaman mümkün */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setItemInput(s)}
            className={`btn shrink-0 px-2.5 py-1 text-[12px] ${
              itemInput === s ? "btn-teal" : "btn-cream"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <input
        value={itemInput}
        onChange={(e) => setItemInput(e.target.value)}
        maxLength={40}
        placeholder="Ne aldın? (örn. Balık ekmek, 1 saat kano)"
        className="sticker-flat bg-cream px-3 py-2 text-sm outline-none focus:border-tomato"
      />
      <div className="flex gap-2">
        {/* Adet/porsiyon — "2 balık ekmek 550₺" → tanesi 275₺ normalize edilir */}
        <div className="sticker-flat flex items-center bg-cream">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-2.5 py-2.5 text-lg font-bold opacity-60"
            aria-label="Adet azalt"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm font-extrabold">{qty}×</span>
          <button
            onClick={() => setQty((q) => Math.min(20, q + 1))}
            className="px-2.5 py-2.5 text-lg font-bold opacity-60"
            aria-label="Adet artır"
          >
            +
          </button>
        </div>
        <div className="sticker-flat flex flex-1 items-center gap-1 bg-cream px-3">
          <span className="text-lg font-bold text-tomato">₺</span>
          <input
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPrice()}
            inputMode="decimal"
            maxLength={8}
            placeholder={qty > 1 ? "toplam ödenen" : "fiyat"}
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <button
          onClick={submitPrice}
          disabled={busy || !priceInput.trim() || !itemInput.trim()}
          className="btn btn-tomato px-4 text-sm"
        >
          Kaydet
        </button>
      </div>
      {qty > 1 && priceInput && (
        <p className="text-xs opacity-60">
          Tanesi ≈ ₺
          {(
            Math.round((Number(priceInput.replace(",", ".").replace(/[^\d.]/g, "")) / qty) * 100) /
            100
          ).toLocaleString("tr-TR")}{" "}
          olarak kaydedilir
        </p>
      )}
      {/* Opsiyonel: fiyat/indirim geçerlilik tarihi (yerel kampanya avcılığı) */}
      <label className="flex items-center gap-2 text-xs opacity-70">
        <span className="shrink-0">📅 Şu tarihe kadar geçerli</span>
        <input
          type="date"
          value={validInput}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setValidInput(e.target.value)}
          className="sticker-flat bg-cream px-2 py-1 text-xs outline-none"
        />
        {validInput && (
          <button onClick={() => setValidInput("")} className="opacity-50">
            ✕
          </button>
        )}
      </label>
      <p className="text-[10px] opacity-40">Bilmiyorsan boş bırak — eklenme tarihi görünür.</p>
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
          <div className="relative overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
            <EmojiBurst seed={burst} />
            <div className="flex items-start gap-3 pt-2">
              <div className="sticker-flat flex h-12 w-12 shrink-0 items-center justify-center text-2xl bg-paper">
                {categoryIcon(pin.category) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={categoryIcon(pin.category)!} alt="" className="h-9 w-9" />
                ) : (
                  cat!.emoji
                )}
              </div>
              <div className="min-w-0 flex-1">
                {editingName ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveName()}
                        maxLength={80}
                        autoFocus
                        placeholder="Doğru mekan adı"
                        className="sticker-flat w-full bg-cream px-2 py-1 text-lg font-extrabold outline-none focus:border-tomato"
                      />
                      <button onClick={saveName} disabled={busy} className="btn btn-tomato px-3 py-1.5 text-sm">
                        ✓
                      </button>
                    </div>
                    <span className="text-[10px] opacity-50">
                      Adı topluluk belirler — en çok önerilen kazanır.
                    </span>
                  </div>
                ) : (
                  <h2 className="flex items-center gap-1.5 text-xl font-extrabold leading-tight">
                    <span className="min-w-0 truncate">{pin.name}</span>
                    {/* Herkes ad önerebilir (topluluk oylamalı) */}
                    <button
                      onClick={() => {
                        setNameInput(pin.name);
                        setEditingName(true);
                      }}
                      className="shrink-0 text-sm opacity-50 hover:opacity-100"
                      aria-label="Doğru adı öner"
                      title="Doğru adı öner"
                    >
                      ✏️
                    </button>
                  </h2>
                )}
                <p className="flex flex-wrap items-center gap-1 text-xs opacity-60">
                  <span>{cat!.label}</span>
                  {pin.isMine && (
                    <button
                      onClick={() => setEditingCat((v) => !v)}
                      className="text-[11px] underline decoration-dotted opacity-80"
                      title="Türü değiştir"
                    >
                      değiştir
                    </button>
                  )}
                  <span>·</span>
                  <Avatar value={pin.author_avatar} size={16} fallback="" />
                  <span>{pin.author} · {timeAgo(pin.created_at)}</span>
                </p>
              </div>
            </div>

            {/* Tür (yer tipi) düzenleyici — yalnız sahibi */}
            {editingCat && pin.isMine && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PLACE_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => saveCategory(t.id)}
                    disabled={busy}
                    className={`btn flex items-center gap-1 px-2.5 py-1 text-[13px] ${
                      placeTypeIdOf(pin.category) === t.id ? "btn-tomato" : "btn-cream"
                    }`}
                  >
                    {t.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.icon} alt="" className="h-[18px] w-[18px]" />
                    ) : (
                      t.emoji
                    )}{" "}
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* 💰 FİYAT HERO — pin açılınca ilk göze çarpan: ne + kaça */}
            {price && (
              <div className="mt-3 sticker flex items-center gap-3 border-tomato bg-[#fdeee7] p-3">
                <div className="min-w-0 flex-1">
                  {pin.price_item && (
                    <div className="truncate text-[15px] font-extrabold leading-tight">
                      {pin.price_item}
                    </div>
                  )}
                  {(() => {
                    const v = validityLabel(pin.price_valid_until);
                    if (v.kind === "none") {
                      if (!pin.price_updated_at) return null;
                      return isStalePrice(pin.price_updated_at) ? (
                        <div className="text-[11px] font-bold text-tomato">
                          🕰️ {timeAgo(pin.price_updated_at)} — hâlâ geçerli mi?
                        </div>
                      ) : (
                        <div className="text-[11px] opacity-55">🕒 {timeAgo(pin.price_updated_at)}</div>
                      );
                    }
                    const cls =
                      v.kind === "expired" ? "text-ink/45" : v.kind === "today" ? "text-tomato" : "text-teal";
                    return (
                      <div className={`text-[11px] font-bold ${cls}`}>
                        {v.kind === "expired" ? "⌛" : "🏷️"} {v.text}
                      </div>
                    );
                  })()}
                </div>
                <div className="display shrink-0 text-4xl font-extrabold leading-none text-tomato">
                  {price}
                </div>
              </div>
            )}

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
                  İlk fiyatı açan <span className="font-bold text-tomato">+10 puan</span> kapar —
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
                {/* Fiyat gir/güncelle — hizmetler dahil tüm mekanlarda */}
                {canPrice &&
                  (editingPrice ? (
                    <div className="mt-2">{priceEditor}</div>
                  ) : (
                    <button
                      onClick={() => setEditingPrice(true)}
                      className="mt-2 text-xs underline opacity-50"
                    >
                      💸 {pin.price == null ? "Fiyat ekle (ürün/hizmet)" : "Fiyat değişti mi? Güncelle"}
                    </button>
                  ))}
              </>
            )}

            <div className="mt-3 flex items-center gap-2">
              {!pin.isMine && (
                <button
                  onClick={thank}
                  disabled={myThanks}
                  className={`btn flex-1 py-2 text-sm ${myThanks ? "btn-teal" : "btn-cream"}`}
                >
                  🙏 {myThanks ? "Teşekkür ettin" : "Teşekkür et"}
                  {pin.thanks > 0 ? ` (${pin.thanks})` : ""}
                </button>
              )}
              <button onClick={share} className="btn btn-mustard flex-1 py-2 text-sm">
                Paylaş 📤
              </button>
            </div>
            <div className="mt-2 flex items-center justify-end gap-2">
              <button onClick={report} className="text-xs underline opacity-50 px-2">
                Bildir / Kapanmış
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
                  <p className="flex items-center gap-1 text-[10px] font-bold text-teal">
                    <Avatar value={c.avatar} size={15} fallback="" />
                    <span>{c.author} <span className="font-normal opacity-50">· {timeAgo(c.created_at)}</span></span>
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
