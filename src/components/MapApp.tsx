"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import {
  KINDS,
  categoryById,
  groupsForKind,
  hasGroups,
  type CategoryGroup,
  type PinKind,
} from "@/lib/categories";
import type { Me, PinSummary } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { getBlocked } from "@/lib/blocklist";
import PinSheet from "./PinSheet";
import NewPinSheet from "./NewPinSheet";
import ProfileSheet from "./ProfileSheet";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ISTANBUL: [number, number] = [28.98, 41.03];

type SheetState =
  | { kind: "none" }
  | { kind: "pin"; id: string }
  | { kind: "new"; lat: number; lng: number; pinKind: PinKind }
  | { kind: "profile" };

const VOTE_ICON: Record<string, string> = { lezzet: "✓", ani: "❤️", sorun: "⚠️" };

export default function MapApp({ initialPinId }: { initialPinId?: string }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const categoriesRef = useRef<string>(""); // API'ye gidecek virgüllü kategori listesi
  const kindRef = useRef<PinKind>("lezzet");

  const [sheet, setSheet] = useState<SheetState>(
    initialPinId ? { kind: "pin", id: initialPinId } : { kind: "none" }
  );
  const [placing, setPlacing] = useState(false);
  const [kind, setKind] = useState<PinKind>("lezzet");
  const [group, setGroup] = useState<CategoryGroup | null>(null); // seçili ana grup
  const [category, setCategory] = useState(""); // grup içindeki seçili alt kategori
  const [me, setMe] = useState<Me | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, key: Date.now() });
  }, []);

  const refreshMe = useCallback(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => {});
  }, []);

  const loadPins = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    const params = new URLSearchParams({
      minLat: String(b.getSouth()),
      maxLat: String(b.getNorth()),
      minLng: String(b.getWest()),
      maxLng: String(b.getEast()),
      kind: kindRef.current,
      categories: categoriesRef.current,
    });
    fetch(`/api/pins?${params}`)
      .then((r) => r.json())
      .then(({ pins }: { pins: PinSummary[] }) => syncMarkers(pins))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncMarkers = useCallback((allPins: PinSummary[]) => {
    const map = mapRef.current;
    if (!map) return;
    const blocked = getBlocked();
    const pins = allPins.filter((p) => !blocked.has(p.authorId));
    const markers = markersRef.current;
    const keep = new Set(pins.map((p) => p.id));
    for (const [id, m] of markers) {
      if (!keep.has(id)) {
        m.remove();
        markers.delete(id);
      }
    }
    for (const pin of pins) {
      if (markers.has(pin.id)) continue;
      const cat = categoryById(pin.category);
      const el = document.createElement("div");
      el.className = "pin-marker" + (pin.confirms >= 3 && pin.confirms > pin.outdated ? " verified" : "");
      const price = formatPrice(pin.price);
      const icon = VOTE_ICON[pin.kind] ?? "✓";
      // Fiyatsız pinler kalabalıkta haritayı boğmasın: sadece emoji (anı pinleri isim gösterir)
      const label =
        price != null
          ? `<span class="price">${price}</span>`
          : pin.kind === "ani"
            ? `<span>${escapeHtml(pin.name.slice(0, 14))}</span>`
            : "";
      el.innerHTML = `
        <div class="bubble${label ? "" : " bubble-mini"}">
          <span>${cat.emoji}</span>
          ${label}
          ${pin.confirms > 0 ? `<span style="color:var(--teal)">${icon}${pin.confirms}</span>` : ""}
        </div>
        <div class="tip"></div>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSheet({ kind: "pin", id: pin.id });
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      markersRef.current.set(pin.id, marker);
    }
  }, []);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapDiv.current,
      style: MAP_STYLE,
      center: ISTANBUL,
      zoom: 12.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.on("moveend", loadPins);
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __map?: maplibregl.Map }).__map = map;
    }
    loadPins();
    refreshMe();
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [loadPins, refreshMe]);

  const clearMarkers = () => {
    for (const m of markersRef.current.values()) m.remove();
    markersRef.current.clear();
  };

  // Filtreyi güncelle: grup + opsiyonel alt kategori → API'ye kategori listesi
  const applyFilter = (g: CategoryGroup | null, catId: string) => {
    if (catId) categoriesRef.current = catId;
    else if (g) categoriesRef.current = g.categories.map((c) => c.id).join(",");
    else categoriesRef.current = "";
    clearMarkers();
    loadPins();
  };

  const pickGroup = (g: CategoryGroup) => {
    const next = group?.id === g.id ? null : g;
    setGroup(next);
    setCategory("");
    applyFilter(next, "");
  };

  const pickCategory = (id: string) => {
    const next = category === id ? "" : id;
    setCategory(next);
    applyFilter(group, next);
  };

  const pickKind = (id: PinKind) => {
    if (id === kind) return;
    setKind(id);
    kindRef.current = id;
    setGroup(null);
    setCategory("");
    categoriesRef.current = "";
    clearMarkers();
    loadPins();
  };

  const locate = () => {
    if (!navigator.geolocation) return showToast("Konum desteklenmiyor 😕");
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
        }),
      () => showToast("Konum alınamadı")
    );
  };

  const confirmPlacement = () => {
    const c = mapRef.current?.getCenter();
    if (!c) return;
    setPlacing(false);
    setSheet({ kind: "new", lat: c.lat, lng: c.lng, pinKind: kind });
  };

  const onPinCreated = (id: string, earned: number) => {
    setSheet({ kind: "pin", id });
    showToast(`+${earned} puan! 🎉`);
    loadPins();
    refreshMe();
  };

  return (
    <div className="fixed inset-0 paper-grain">
      <div ref={mapDiv} className="map-canvas-host absolute inset-0" />

      {/* Üst bar */}
      <header className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="sticker pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5">
            <span className="text-xl">📍</span>
            <span className="display text-xl font-extrabold tracking-tight text-tomato">Pinle</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setSheet({ kind: "profile" })}
            className="btn btn-mustard pointer-events-auto px-3.5 py-1.5 text-sm"
          >
            ⭐ {me ? me.points : "—"}
          </button>
        </div>
        {/* Katman sekmeleri */}
        <div className="mt-2 flex gap-1.5 pointer-events-auto">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => pickKind(k.id)}
              className={`btn px-3.5 py-1.5 text-sm ${kind === k.id ? "btn-tomato" : "btn-cream"}`}
            >
              {k.emoji} {k.label}
            </button>
          ))}
        </div>
        {/* Ana grup çipleri (gruplu kind için) — çubuk şişmesin diye sadece gruplar */}
        {hasGroups(kind) ? (
          <>
            <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 pointer-events-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
              {groupsForKind(kind).map((g) => (
                <button
                  key={g.id}
                  onClick={() => pickGroup(g)}
                  className={`btn shrink-0 px-3 py-1 text-[13px] ${
                    group?.id === g.id ? "btn-tomato" : "btn-cream"
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
            {/* Alt kategoriler — yalnızca bir grup seçiliyken açılır */}
            {group && (
              <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1 pointer-events-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
                <button
                  onClick={() => pickCategory("")}
                  className={`btn shrink-0 px-3 py-1 text-xs ${
                    category === "" ? "btn-teal" : "btn-cream"
                  }`}
                >
                  ✳️ Tümü
                </button>
                {group.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => pickCategory(c.id)}
                    className={`btn shrink-0 px-3 py-1 text-xs ${
                      category === c.id ? "btn-teal" : "btn-cream"
                    }`}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Tek gruplu kind (Anı/Sorun): doğrudan kategoriler */
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 pointer-events-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
            {groupsForKind(kind)[0]?.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCategory(c.id)}
                className={`btn shrink-0 px-3 py-1 text-[13px] ${
                  category === c.id ? "btn-tomato" : "btn-cream"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Nişangah modu */}
      {placing && (
        <>
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-full pointer-events-none crosshair-pin">
            <svg width="44" height="56" viewBox="0 0 44 56">
              <path
                d="M22 2C11 2 2.5 10.6 2.5 21.3 2.5 36 19 52 21 54a1.4 1.4 0 0 0 2 0c2-2 18.5-18 18.5-32.7C41.5 10.6 33 2 22 2z"
                fill="#e8442e"
                stroke="#221b15"
                strokeWidth="2.5"
              />
              <circle cx="22" cy="21" r="8" fill="#fffdf7" stroke="#221b15" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
            <div className="sticker p-3 flex flex-col gap-2">
              <p className="text-center text-sm font-semibold">
                Haritayı kaydır, pini mekanın üstüne getir 👆
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPlacing(false)} className="btn btn-cream flex-1 py-2.5">
                  Vazgeç
                </button>
                <button onClick={confirmPlacement} className="btn btn-tomato flex-[2] py-2.5">
                  Burayı Pinle 📌
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sağ alt kontroller */}
      {!placing && sheet.kind === "none" && (
        <div className="absolute bottom-0 right-0 z-20 flex flex-col items-end gap-2.5 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <button onClick={locate} className="btn btn-cream h-11 w-11 text-lg" aria-label="Konumumu bul">
            🧿
          </button>
          <button onClick={() => setPlacing(true)} className="btn btn-tomato px-6 py-3.5 text-lg">
            📌 Pinle
          </button>
        </div>
      )}

      {/* Alt sayfalar */}
      <PinSheet
        pinId={sheet.kind === "pin" ? sheet.id : null}
        onClose={() => setSheet({ kind: "none" })}
        onToast={showToast}
        onChanged={() => {
          loadPins();
          refreshMe();
        }}
      />
      <NewPinSheet
        coords={sheet.kind === "new" ? { lat: sheet.lat, lng: sheet.lng } : null}
        pinKind={sheet.kind === "new" ? sheet.pinKind : "lezzet"}
        onClose={() => setSheet({ kind: "none" })}
        onCreated={onPinCreated}
      />
      <ProfileSheet
        open={sheet.kind === "profile"}
        me={me}
        onClose={() => setSheet({ kind: "none" })}
      />

      {toast && (
        <div key={toast.key} className="toast">
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
