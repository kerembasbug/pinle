"use client";

import { useEffect, useRef, useState } from "react";
import { categoryById, categoryIcon } from "@/lib/categories";
import { formatPrice } from "@/lib/types";

export type SearchResult = {
  id: string;
  name: string;
  category: string;
  city: string | null;
  district: string | null;
  price: number | null;
  lat: number;
  lng: number;
};

// Merkezler lib/cityCenters.ts'te (tek kaynak — SEO sayfaları da aynısını kullanır)
import { PLACE_CHIPS } from "@/lib/cityCenters";
export { PLACE_CHIPS as CITY_CENTERS };

type Props = {
  open: boolean;
  onClose: () => void;
  onPickResult: (r: SearchResult) => void;
  onPickCity: (center: [number, number], zoom?: number) => void;
  onLocate: () => void;
};

export default function SearchSheet({ open, onClose, onPickResult, onPickCity, onLocate }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
    else {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d) => setResults(d.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
  }, [q]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/20" onClick={onClose} />}
      <div className={`sheet z-40 ${open ? "open" : ""}`}>
        <div className="sheet-grip" />
        <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <div className="sticker-flat mt-1 flex items-center gap-2 bg-cream px-3 py-2 focus-within:border-tomato">
            <span className="text-lg">🔎</span>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Mekan ara (örn. Kent Lokantası)"
              className="w-full bg-transparent text-[15px] outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-sm opacity-50">
                ✕
              </button>
            )}
          </div>

          {/* Sonuçlar */}
          {q.trim().length >= 2 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {loading && <p className="text-sm opacity-50 px-1">Aranıyor…</p>}
              {!loading && results.length === 0 && (
                <p className="text-sm opacity-50 px-1">Sonuç yok.</p>
              )}
              {results.map((r) => {
                const cat = categoryById(r.category);
                const price = formatPrice(r.price);
                return (
                  <button
                    key={r.id}
                    onClick={() => onPickResult(r)}
                    className="sticker-flat flex items-center gap-3 bg-cream px-3 py-2 text-left"
                  >
                    {categoryIcon(r.category) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={categoryIcon(r.category)!} alt="" className="h-7 w-7 shrink-0" />
                    ) : (
                      <span className="text-xl">{cat.emoji}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{r.name}</p>
                      <p className="text-xs opacity-60">
                        {[r.district, r.city].filter(Boolean).join(", ") || cat.label}
                      </p>
                    </div>
                    {price && <span className="display font-extrabold text-tomato">{price}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Şehirler + konum (arama boşken) */}
          {q.trim().length < 2 && (
            <>
              <h3 className="mt-4 text-sm font-bold opacity-70">Şehir</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PLACE_CHIPS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => onPickCity(c.center, c.zoom)}
                    className="btn btn-cream px-3 py-1.5 text-sm"
                  >
                    🏙️ {c.name}
                  </button>
                ))}
              </div>
              <button onClick={onLocate} className="btn btn-teal mt-4 w-full py-3">
                🧭 Konumuma Git
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
