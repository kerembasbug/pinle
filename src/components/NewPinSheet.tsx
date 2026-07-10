"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  groupsForKind,
  hasGroups,
  itemSuggestionsFor,
  kindMeta,
  type PinKind,
} from "@/lib/categories";

type Props = {
  coords: { lat: number; lng: number } | null;
  pinKind: PinKind;
  onClose: () => void;
  onCreated: (id: string, earned: number) => void;
};

export default function NewPinSheet({ coords, pinKind, onClose, onCreated }: Props) {
  const meta = kindMeta(pinKind);
  const groups = useMemo(() => groupsForKind(pinKind), [pinKind]);
  const grouped = hasGroups(pinKind);
  const [groupId, setGroupId] = useState(groups[0].id);
  const activeGroup = groups.find((g) => g.id === groupId) ?? groups[0];
  const [name, setName] = useState("");
  const [category, setCategory] = useState(groups[0].categories[0].id);
  const [price, setPrice] = useState("");
  const [priceItem, setPriceItem] = useState("");
  const [qty, setQty] = useState(1);
  const [noPrice, setNoPrice] = useState(false); // "fiyatı şu an bilmiyorum" kaçışı
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoName, setPhotoName] = useState("");

  useEffect(() => {
    if (coords) {
      const gs = groupsForKind(pinKind);
      setName("");
      setGroupId(gs[0].id);
      setCategory(gs[0].categories[0].id);
      setPrice("");
      setPriceItem("");
      setQty(1);
      setNoPrice(false);
      setNote("");
      setError("");
      setPhotoName("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [coords, pinKind]);

  const suggestions = itemSuggestionsFor(category);
  const priceRequired = meta.hasPrice && !noPrice;
  const priceOk = !priceRequired || (price.trim() !== "" && priceItem.trim() !== "");

  const submit = async () => {
    if (!coords || busy) return;
    setError("");
    if (priceRequired && !priceOk) {
      setError("Fiyat ve ne için olduğunu gir — Pinle'nin kalbi bu. (Bilmiyorsan 'şu an bilmiyorum'u işaretle)");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("kind", pinKind);
    fd.set("category", category);
    fd.set("price", meta.hasPrice && !noPrice ? price : "");
    fd.set("price_item", meta.hasPrice && !noPrice ? priceItem : "");
    fd.set("price_qty", String(qty));
    fd.set("note", note);
    fd.set("lat", String(coords.lat));
    fd.set("lng", String(coords.lng));
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("photo", file);

    const res = await fetch("/api/pins", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Bir şeyler ters gitti");
    onCreated(data.id, data.earned);
  };

  return (
    <>
      {coords && <div className="fixed inset-0 z-20 bg-ink/20" onClick={onClose} />}
      <div className={`sheet ${coords ? "open" : ""}`}>
        <div className="sheet-grip" />
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <h2 className="pt-1 text-xl font-extrabold">{meta.formTitle}</h2>
          <p className="text-xs opacity-60">{meta.formHint}</p>

          {/* 💰 FİYAT ÖNCE — uygulamanın kalbi, ayrı ve baskın tasarım */}
          {meta.hasPrice && (
            <div className="sticker mt-3 border-tomato bg-[#fdeee7] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-tomato">💰 Ne aldın, kaça?</p>
                <label className="flex items-center gap-1 text-[11px] opacity-60">
                  <input
                    type="checkbox"
                    checked={noPrice}
                    onChange={(e) => setNoPrice(e.target.checked)}
                  />
                  şu an bilmiyorum
                </label>
              </div>
              {!noPrice && (
                <>
                  <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setPriceItem(s)}
                        className={`btn shrink-0 px-2.5 py-1 text-[12px] ${
                          priceItem === s ? "btn-teal" : "btn-cream"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    value={priceItem}
                    onChange={(e) => setPriceItem(e.target.value)}
                    maxLength={40}
                    placeholder="Ürün/hizmet (örn. Balık ekmek, 1 saat kano)"
                    className="sticker-flat mt-2 w-full bg-cream px-3 py-2.5 text-[15px] outline-none focus:border-tomato"
                  />
                  <div className="mt-2 flex gap-2">
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
                    <div className="sticker-flat flex flex-1 items-center bg-cream focus-within:border-tomato">
                      <span className="display pl-3 text-lg font-bold text-tomato">₺</span>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))}
                        inputMode="decimal"
                        placeholder={qty > 1 ? "toplam ödenen" : "fiyat"}
                        className="w-full bg-transparent px-2 py-2.5 text-[15px] outline-none"
                      />
                    </div>
                  </div>
                  {qty > 1 && price && (
                    <p className="mt-1 text-xs opacity-60">
                      Tanesi ≈ ₺
                      {(
                        Math.round((Number(price.replace(",", ".")) / qty) * 100) / 100
                      ).toLocaleString("tr-TR")}{" "}
                      olarak kaydedilir
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder={meta.namePlaceholder}
            className="sticker-flat mt-3 w-full px-3 py-2.5 text-[15px] outline-none focus:border-tomato bg-cream"
          />

          {/* Gruplu kind: önce grup, sonra alt kategori */}
          {grouped && (
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGroupId(g.id);
                    setCategory(g.categories[0].id);
                  }}
                  className={`btn shrink-0 px-3 py-1 text-[13px] ${
                    groupId === g.id ? "btn-tomato" : "btn-cream"
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeGroup.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`btn px-3 py-1 text-[13px] ${
                  category === c.id ? (grouped ? "btn-teal" : "btn-tomato") : "btn-cream"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className={`btn flex-1 px-3 py-2 text-sm ${photoName ? "btn-teal" : "btn-cream"}`}
            >
              {photoName
                ? "📷 Fotoğraf eklendi ✓"
                : "📷 Ürünün/fiyat etiketinin fotoğrafı (+5 puan)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}
            />
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            rows={pinKind === "ani" ? 4 : 2}
            placeholder={meta.notePlaceholder}
            className="sticker-flat mt-2 w-full resize-none px-3 py-2.5 text-[15px] outline-none focus:border-tomato bg-cream"
          />

          {error && <p className="mt-2 text-sm font-semibold text-tomato">⚠ {error}</p>}

          <div className="mt-3 flex gap-2">
            <button onClick={onClose} className="btn btn-cream flex-1 py-3">
              Vazgeç
            </button>
            <button
              onClick={submit}
              disabled={busy || name.trim().length < 2 || !priceOk}
              className="btn btn-tomato flex-[2] py-3"
            >
              {busy ? "Pinleniyor…" : "Pinle! (+10 puan)"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
