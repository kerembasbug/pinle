"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES_BY_KIND, kindMeta, type PinKind } from "@/lib/categories";

type Props = {
  coords: { lat: number; lng: number } | null;
  pinKind: PinKind;
  onClose: () => void;
  onCreated: (id: string, earned: number) => void;
};

export default function NewPinSheet({ coords, pinKind, onClose, onCreated }: Props) {
  const meta = kindMeta(pinKind);
  const categories = CATEGORIES_BY_KIND[pinKind];
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0].id);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoName, setPhotoName] = useState("");

  useEffect(() => {
    if (coords) {
      setName("");
      setCategory(CATEGORIES_BY_KIND[pinKind][0].id);
      setPrice("");
      setNote("");
      setError("");
      setPhotoName("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [coords, pinKind]);

  const submit = async () => {
    if (!coords || busy) return;
    setError("");
    setBusy(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("kind", pinKind);
    fd.set("category", category);
    fd.set("price", meta.hasPrice ? price : "");
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

          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`btn px-3 py-1 text-[13px] ${category === c.id ? "btn-tomato" : "btn-cream"}`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder={meta.namePlaceholder}
            className="sticker-flat mt-3 w-full px-3 py-2.5 text-[15px] outline-none focus:border-tomato bg-cream"
          />
          <div className="mt-2 flex gap-2">
            {meta.hasPrice && (
              <div className="sticker-flat flex flex-1 items-center bg-cream focus-within:border-tomato">
                <span className="display pl-3 text-lg font-bold text-tomato">₺</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ""))}
                  inputMode="decimal"
                  placeholder="Fiyat (ops.)"
                  className="w-full bg-transparent px-2 py-2.5 text-[15px] outline-none"
                />
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className={`btn px-3 py-2 text-sm ${photoName ? "btn-teal" : "btn-cream"} ${meta.hasPrice ? "" : "flex-1"}`}
            >
              {photoName ? "📷 Fotoğraf eklendi ✓" : "📷 Fotoğraf ekle (+5 puan)"}
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
              disabled={busy || name.trim().length < 2}
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
