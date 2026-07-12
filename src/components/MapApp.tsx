"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import maplibregl from "maplibre-gl";
import {
  PLACE_TYPES,
  categoryById,
  categoryIcon,
  categoryInKind,
  categoryFilterIds,
  isPriceable,
  placeTypeIdOf,
  type PinKind,
} from "@/lib/categories";
import type { Me, PinSummary } from "@/lib/types";
import { formatPrice } from "@/lib/types";
import { isStalePrice, validityLabel } from "@/lib/validity";
import { getBlocked } from "@/lib/blocklist";
import type { SearchResult } from "./SearchSheet";

// Sheet/overlay bileşenleri yalnızca etkileşimde açılır → ilk JS bundle'ından
// çıkar (lazy-load). Kritik yol yalnızca harita + MapLibre olur.
const PinSheet = dynamic(() => import("./PinSheet"), { ssr: false });
const InstallPrompt = dynamic(() => import("./InstallPrompt"), { ssr: false });
const NewPinSheet = dynamic(() => import("./NewPinSheet"), { ssr: false });
const ProfileSheet = dynamic(() => import("./ProfileSheet"), { ssr: false });
const SearchSheet = dynamic(() => import("./SearchSheet"), { ssr: false });
const Onboarding = dynamic(() => import("./Onboarding"), { ssr: false });
const AuthSheet = dynamic(() => import("./AuthSheet"), { ssr: false });

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const ISTANBUL: [number, number] = [28.98, 41.03];

type SheetState =
  | { kind: "none" }
  | { kind: "pin"; id: string }
  | { kind: "new"; lat: number; lng: number; pinKind: PinKind }
  | { kind: "profile" };

const VOTE_ICON: Record<string, string> = { lezzet: "✓", ani: "❤️", sorun: "⚠️" };

export default function MapApp({
  initialPinId,
  initialCenter,
  initialCategory,
}: {
  initialPinId?: string;
  initialCenter?: [number, number];
  initialCategory?: string;
}) {
  // Şehir/kategori sayfasından gelen ön-filtre → yer tipi (eski id de çözülür)
  const initialType =
    initialCategory && categoryInKind("lezzet", initialCategory)
      ? placeTypeIdOf(initialCategory)
      : "";

  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const meMarkerRef = useRef<maplibregl.Marker | null>(null); // kullanıcının kendi konumu
  // API'ye gidecek virgüllü kategori listesi (seçili yer tipinin genişletilmiş id'leri)
  const categoriesRef = useRef<string>(initialType ? categoryFilterIds(initialType).join(",") : "");
  const kindRef = useRef<PinKind>("lezzet");
  const dealsRef = useRef(false); // yalnızca aktif indirim/kampanya pinleri
  // Pinlerin GERÇEK koordinatları (API'den). querySourceFeatures tile ızgarasına
  // yuvarlanmış geometri döndürür — düşük zoomda yüzlerce metre kayar. DOM
  // marker'ları daima buradaki hassas koordinatla konumlanır.
  const pinCoordsRef = useRef<Map<string, [number, number]>>(new Map());

  const [sheet, setSheet] = useState<SheetState>(
    initialPinId ? { kind: "pin", id: initialPinId } : { kind: "none" }
  );
  const [placing, setPlacing] = useState(false);
  const [placeType, setPlaceType] = useState(initialType); // seçili yer tipi ("" = tümü)
  const [dealsOnly, setDealsOnly] = useState(false); // 🏷️ İndirimler filtresi
  const [me, setMe] = useState<Me | null>(null);
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const liveMarkersRef = useRef<maplibregl.Marker[]>([]);

  const showToast = useCallback((msg: string) => {
    setToast({ msg, key: Date.now() });
  }, []);

  // Geri tuşu (TWA/Android): sheet açıkken geri = sheet'i kapat, uygulamadan çıkma.
  // Overlay açılınca 1 history girdisi it; popstate gelince overlay'leri kapat.
  const anyOverlayOpen = sheet.kind !== "none" || searchOpen || authOpen || placing;
  const overlayOpenRef = useRef(anyOverlayOpen);
  overlayOpenRef.current = anyOverlayOpen;
  const pushedRef = useRef(false);
  useEffect(() => {
    if (anyOverlayOpen && !pushedRef.current) {
      history.pushState({ pinleOverlay: 1 }, "");
      pushedRef.current = true;
    }
  }, [anyOverlayOpen]);
  useEffect(() => {
    const onPop = () => {
      pushedRef.current = false;
      if (overlayOpenRef.current) {
        setSheet({ kind: "none" });
        setSearchOpen(false);
        setAuthOpen(false);
        setPlacing(false);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 🔴 Canlı mod: son 60 dk'nın hareketleri (yeni pin + fiyat) nabız işaretleriyle.
  // Websocket yok — 30 sn'de bir hafif sorgu; kapatınca işaretler temizlenir.
  useEffect(() => {
    if (!liveMode) return;
    let cancelled = false;
    const clear = () => {
      for (const m of liveMarkersRef.current) m.remove();
      liveMarkersRef.current = [];
    };
    const load = async (first = false) => {
      try {
        const res = await fetch("/api/live");
        const data = (await res.json()) as {
          events: { id: string; lat: number; lng: number; type: string; name: string }[];
        };
        if (cancelled) return;
        const map = mapRef.current;
        if (!map) return;
        clear();
        for (const ev of data.events) {
          const el = document.createElement("div");
          el.className = "live-marker";
          el.innerHTML = `<div class="live-ping"></div><div class="live-dot">${
            ev.type === "price" ? "🏷️" : "📌"
          }</div>`;
          el.title = ev.name;
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSheet({ kind: "pin", id: ev.id });
          });
          liveMarkersRef.current.push(
            new maplibregl.Marker({ element: el, anchor: "center" })
              .setLngLat([ev.lng, ev.lat])
              .addTo(map)
          );
        }
        if (first) showToast(`🔴 Son 1 saatte ${data.events.length} hareket`);
      } catch {
        /* sessiz — sonraki turda tekrar dener */
      }
    };
    load(true);
    const t = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(t);
      clear();
    };
  }, [liveMode, showToast]);

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
      deals: dealsRef.current ? "1" : "",
    });
    fetch(`/api/pins?${params}`)
      .then((r) => r.json())
      .then(({ pins }: { pins: PinSummary[] }) => {
        const src = map.getSource("pins") as maplibregl.GeoJSONSource | undefined;
        if (!src) return;
        const blocked = getBlocked();
        for (const p of pins) pinCoordsRef.current.set(p.id, [p.lng, p.lat]);
        const features = pins
          .filter((p) => !blocked.has(p.authorId))
          .map((p) => ({
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
            properties: {
              id: p.id,
              emoji: categoryById(p.category).emoji,
              category: p.category,
              price: p.price ?? null,
              kind: p.kind,
              confirms: p.confirms,
              name: p.name,
              deal: p.price_valid_until && validityLabel(p.price_valid_until).kind !== "expired" ? 1 : 0,
              // Kürasyon: 60+ gün önce girilmiş fiyat soluk gösterilir (aktif indirim hariç)
              stale: p.price != null && !p.price_valid_until && isStalePrice(p.price_updated_at) ? 1 : 0,
              verified: p.confirms >= 3 && p.confirms > p.outdated ? 1 : 0,
            },
          }));
        src.setData({ type: "FeatureCollection", features });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kümelenmemiş (tekil) pinler için DOM marker'ları senkronla — emoji/fiyat görünümü korunur
  const syncDomMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("pins")) return;
    const feats = map.querySourceFeatures("pins", {
      filter: ["!", ["has", "point_count"]],
    });
    const markers = markersRef.current;
    const seen = new Set<string>();
    for (const f of feats) {
      const p = f.properties as Record<string, unknown>;
      const id = p.id as string;
      if (seen.has(id)) continue;
      seen.add(id);
      // Hassas koordinat: API'den gelen gerçek konum; tile geometrisi yalnızca
      // yedek (düşük zoomda tile yuvarlaması pinleri kaydırır).
      const exact =
        pinCoordsRef.current.get(id) ??
        ((f.geometry as GeoJSON.Point).coordinates as [number, number]);
      const existing = markers.get(id);
      if (existing) {
        existing.setLngLat(exact); // önceden yuvarlanmış konumla oluşmuşsa düzelt
        continue;
      }
      const el = document.createElement("div");
      el.className =
        "pin-marker fresh" + (p.verified ? " verified" : "") + (p.deal ? " has-deal" : "");
      setTimeout(() => el.classList.remove("fresh"), 600); // doğuş animasyonu bir kez
      const price = formatPrice(typeof p.price === "number" ? p.price : null);
      const icon = VOTE_ICON[p.kind as string] ?? "✓";
      const priceItem = typeof p.price_item === "string" ? p.price_item.slice(0, 12) : "";
      const label =
        price != null
          ? `<span class="price${p.stale ? " price-stale" : ""}">${p.stale ? "🕰️ " : ""}${priceItem ? escapeHtml(priceItem) + " " : ""}${price}</span>`
          : p.kind === "ani"
            ? `<span>${escapeHtml(String(p.name).slice(0, 14))}</span>`
            : isPriceable(p.kind as PinKind, String(p.category))
              ? `<span class="price-missing">₺?</span>` // yeme-içme, fiyat bekliyor — dokun, ekle
              : "";
      const confirms = Number(p.confirms) || 0;
      const catIco = categoryIcon(String(p.category ?? ""));
      el.innerHTML = `
        <div class="bubble${label ? "" : " bubble-mini"}">
          ${p.deal ? `<span class="deal-tag">🏷️</span>` : ""}
          ${catIco ? `<img class="cat-ico" src="${catIco}" alt="">` : `<span>${p.emoji}</span>`}
          ${label}
          ${confirms > 0 ? `<span style="color:var(--teal)">${icon}${confirms}</span>` : ""}
        </div>
        <div class="tip"></div>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSheet({ kind: "pin", id });
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(exact)
        .addTo(map);
      markers.set(id, marker);
    }
    for (const [id, m] of markers) {
      if (!seen.has(id)) {
        m.remove();
        markers.delete(id);
      }
    }
  }, []);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapDiv.current,
      style: MAP_STYLE,
      center: initialCenter ?? ISTANBUL,
      zoom: initialCenter ? 12.5 : 12.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __map?: maplibregl.Map }).__map = map;
    }

    map.on("load", () => {
      map.addSource("pins", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 55,
      });
      // Küme balonları — sayıya göre büyür
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "pins",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#e8442e",
          "circle-stroke-color": "#221b15",
          "circle-stroke-width": 2.5,
          "circle-radius": ["step", ["get", "point_count"], 18, 20, 24, 100, 32],
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "pins",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Noto Sans Regular"],
          "text-size": 15,
        },
        paint: { "text-color": "#ffffff" },
      });
      // Kümeye tıkla → aç
      map.on("click", "clusters", (e) => {
        const f = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        const clusterId = f.properties?.cluster_id;
        const src = map.getSource("pins") as maplibregl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        });
      });
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));
      // Harita durulunca tekil DOM marker'ları senkronla
      map.on("idle", syncDomMarkers);
      map.on("moveend", loadPins);
      loadPins();
    });

    refreshMe();
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [loadPins, syncDomMarkers, refreshMe]);

  const clearMarkers = () => {
    for (const m of markersRef.current.values()) m.remove();
    markersRef.current.clear();
  };

  // Yer tipi filtresi: seçince o tipin genişletilmiş id listesini API'ye gönder.
  const pickType = (id: string) => {
    const next = placeType === id ? "" : id;
    setPlaceType(next);
    categoriesRef.current = next ? categoryFilterIds(next).join(",") : "";
    clearMarkers();
    loadPins();
  };

  // 🏷️ İndirimler: yalnızca geçerlilik tarihi bugünden ileri olan kampanya pinleri.
  const toggleDeals = () => {
    const next = !dealsOnly;
    setDealsOnly(next);
    dealsRef.current = next;
    clearMarkers();
    loadPins();
    if (next) showToast("🏷️ Sadece aktif indirimler gösteriliyor");
  };

  const locate = () => {
    if (!navigator.geolocation) return showToast("Konum desteklenmiyor 😕");
    showToast("Konumun bulunuyor…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const map = mapRef.current;
        if (!map) return;
        const lngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        if (meMarkerRef.current) {
          meMarkerRef.current.setLngLat(lngLat);
        } else {
          const el = document.createElement("div");
          el.className = "me-marker";
          el.innerHTML = `<div class="me-pulse"></div><div class="me-dot">🧍</div>`;
          meMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat(lngLat)
            .addTo(map);
        }
        map.flyTo({ center: lngLat, zoom: 15 });
        showToast("Buradasın 🧍");
      },
      () => showToast("Konum alınamadı"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const confirmPlacement = () => {
    const c = mapRef.current?.getCenter();
    if (!c) return;
    setPlacing(false);
    setSheet({ kind: "new", lat: c.lat, lng: c.lng, pinKind: "lezzet" });
  };

  const onPinCreated = (id: string, earned: number) => {
    setSheet({ kind: "pin", id });
    showToast(`+${earned} puan! 🎉`);
    loadPins();
    refreshMe();
  };

  // flyTo, rAF kısıtlanınca (arka plan sekmesi / güç tasarrufu modu) sessizce
  // donar ve harita hiç kımıldamaz. Kısa süre sonra kamera hiç oynamadıysa
  // jumpTo ile garanti zıpla — "şehir seçince ışınlanmıyor" bunu çözer.
  const flyOrJump = (opts: maplibregl.FlyToOptions & { center: [number, number] }) => {
    const map = mapRef.current;
    if (!map) return;
    const start = map.getCenter();
    map.flyTo(opts);
    setTimeout(() => {
      const c = map.getCenter();
      const moved =
        Math.abs(c.lng - start.lng) > 1e-4 || Math.abs(c.lat - start.lat) > 1e-4;
      if (!moved) map.jumpTo({ center: opts.center, zoom: opts.zoom });
    }, 400);
  };

  const gotoResult = (r: SearchResult) => {
    setSearchOpen(false);
    flyOrJump({ center: [r.lng, r.lat], zoom: 16 });
    setTimeout(() => setSheet({ kind: "pin", id: r.id }), 400);
  };

  // Yeni pin formundan "zaten var olan mekan" seçilince: mükerrer açma, o pini aç.
  const openExistingPin = (id: string) => {
    setSheet({ kind: "pin", id });
  };

  const gotoCity = (center: [number, number]) => {
    setSearchOpen(false);
    flyOrJump({ center, zoom: 12.5 });
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSheet({ kind: "none" });
    showToast("Çıkış yapıldı 👋");
    refreshMe();
  };

  // Davet linkiyle geliş (?ref=KOD): yeni kullanıcıysa davet edeni bağla.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ref = p.get("ref");
    if (!ref) return;
    fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: ref }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) showToast("🎉 Davetle geldin — ilk pinini at, ikiniz de puan kazanın!");
      })
      .catch(() => {});
    p.delete("ref");
    const rest = p.toString();
    window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
  }, [showToast]);

  // E-posta linkinden dönüş (?auth=ok / expired)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const a = p.get("auth");
    if (!a) return;
    if (a === "ok") {
      showToast("Giriş başarılı 🎉");
      refreshMe();
    } else if (a === "expired") {
      showToast("Bağlantının süresi dolmuş, tekrar dene");
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, [showToast, refreshMe]);

  return (
    <div className="fixed inset-0 paper-grain">
      <div ref={mapDiv} className="map-canvas-host absolute inset-0" />

      {/* Üst bar */}
      <header className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="sticker pointer-events-auto flex items-center gap-1 px-3 py-1.5">
            <span className="text-lg">📍</span>
            <span className="display text-lg font-extrabold tracking-tight text-tomato">Pinle</span>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="sticker pointer-events-auto flex flex-1 items-center gap-2 px-3 py-1.5 text-sm opacity-90"
          >
            <span>🔎</span>
            <span className="opacity-60">Ara / şehir seç…</span>
          </button>
          <button
            key={me?.points ?? -1} // puan değişince remount → nabız animasyonu oynar
            onClick={() => setSheet({ kind: "profile" })}
            className="btn btn-mustard points-pop pointer-events-auto px-3 py-1.5 text-sm"
          >
            ⭐ {me ? me.points : "—"}
          </button>
        </div>
        {/* Yer tipi filtresi — tek seviye, kaydırılabilir tek satır */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 pointer-events-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none]">
          <button
            onClick={toggleDeals}
            className={`btn shrink-0 px-3 py-1 text-[13px] ${
              dealsOnly ? "btn-mustard" : "btn-cream"
            }`}
            aria-pressed={dealsOnly}
          >
            🏷️ İndirimler
          </button>
          <button
            onClick={() => pickType("")}
            className={`btn shrink-0 px-3 py-1 text-[13px] ${
              placeType === "" ? "btn-tomato" : "btn-cream"
            }`}
          >
            ✳️ Tümü
          </button>
          {PLACE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => pickType(t.id)}
              className={`btn flex shrink-0 items-center gap-1 px-2.5 py-1 text-[13px] ${
                placeType === t.id ? "btn-tomato" : "btn-cream"
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
          <button
            onClick={() => setLiveMode((v) => !v)}
            className={`btn grid h-11 w-11 place-items-center ${
              liveMode ? "btn-tomato live-btn-on" : "btn-cream"
            }`}
            aria-label={liveMode ? "Canlı mod açık — kapat" : "Canlı hareketleri gör (son 1 saat)"}
            aria-pressed={liveMode}
            title="Canlı hareketler (son 1 saat)"
          >
            {/* Radar/nabız ikonu — açıkken dalgalar yayılır (harita ping'iyle aynı dil) */}
            <svg
              className="live-ico"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle className="core" cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
              <path className="ring ring1" d="M7.4 16.6a6.5 6.5 0 0 1 0-9.2" opacity={liveMode ? 1 : 0.5} />
              <path className="ring ring1" d="M16.6 7.4a6.5 6.5 0 0 1 0 9.2" opacity={liveMode ? 1 : 0.5} />
              <path className="ring ring2" d="M4.7 19.3a10 10 0 0 1 0-14.6" opacity={liveMode ? 1 : 0.28} />
              <path className="ring ring2" d="M19.3 4.7a10 10 0 0 1 0 14.6" opacity={liveMode ? 1 : 0.28} />
            </svg>
          </button>
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
        onPickExisting={openExistingPin}
      />
      <ProfileSheet
        open={sheet.kind === "profile"}
        me={me}
        onClose={() => setSheet({ kind: "none" })}
        onOpenAuth={() => {
          setSheet({ kind: "none" });
          setAuthOpen(true);
        }}
        onLogout={logout}
        onToast={showToast}
        onChanged={refreshMe}
      />
      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onToast={showToast}
        onLinked={refreshMe}
      />
      <SearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onPickResult={gotoResult}
        onPickCity={gotoCity}
        onLocate={() => {
          setSearchOpen(false);
          locate();
        }}
      />

      <Onboarding />
      <InstallPrompt onToast={showToast} />

      {toast && (
        <div key={toast.key} className="toast">
          {toast.msg}
        </div>
      )}
      {/* Puan kazandıran toast'larda mini konfeti — dopamin */}
      {toast && toast.msg.includes("puan") && (
        <div key={`b${toast.key}`} className="toast-burst" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="burst-emoji"
              style={{
                left: `${10 + ((i * 61) % 80)}%`,
                animationDelay: `${(i % 4) * 70}ms`,
                fontSize: `${14 + ((i * 5) % 12)}px`,
              }}
            >
              {["⭐", "🎉", "✨", "💛"][i % 4]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
